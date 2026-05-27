const { dialogflow } = require('actions-on-google');
const functions = require('firebase-functions');
const _ = require('lodash');

const errors = require('../../errors');
const strings = require('../../strings');
const { debug, error, warning } = require('../../utils/logger')('ia:index');

const buildHandlers = require('./handler/builder');
const dbConnector = require('./firestore').firestore;
const after = require('./middlewares/after');
const firestoreUserDataMiddlewareBuilder = require('./middlewares/firestore-user-data');
const logRequestMiddleware = require('./middlewares/log-request');
const logEmptySessionDataMiddleware = require('./middlewares/log-empty-session-data');
const logSessionDurationMiddleware = require('./middlewares/log-session-duration');
const pipelineMiddleware = require('./middlewares/pipeline');
const userUIDMiddleware = require('./middlewares/user-uid');

module.exports = (actionsMap) => {
  const app = dialogflow();

  let handlers = [];
  if (actionsMap) {
    handlers = buildHandlers({ actionsMap, after });
    handlers.forEach(
      ({ intent, handler }) => app.intent(intent, handler)
    );
  }

  /**
   * @private
   *
   * get handler by intent name
   *
   * @param name
   * @returns {*}
   */
  function getHandlerByIntent (name) {
    const handlerItem = handlers.find(h => h.intent === name);
    return handlerItem && handlerItem.handler;
  }

  const globalErrorHandler = getHandlerByIntent('global-error');
  if (!globalErrorHandler) {
    warning(
      'we missed action handler actions/global-error, ' +
      'which is required to handle global unhandled errors.');
  }

  const httpRequestErrorHandler = getHandlerByIntent('http-request-error');
  if (!httpRequestErrorHandler) {
    warning(
      'we missed action handler actions/http-request-error, ' +
      'which is required to handle http request errors.');
  }

  const unhandledHandler = getHandlerByIntent('unhandled');
  if (!unhandledHandler) {
    warning(
      'we missed action handler actions/unhandled,' +
      'which is require to handle unhandled intents.'
    );
  }

  app.middleware(pipelineMiddleware.start);

  const db = dbConnector.connect();

  // prepare user's data
  app.middleware(userUIDMiddleware);

  const firestoreUserDataMiddleware = firestoreUserDataMiddlewareBuilder(db);
  // fetch user's data from firestore
  app.middleware(firestoreUserDataMiddleware.start);

  // TODO: fix, once it would be official supported
  // for the moment action on google api doesn't support
  // middleware which should runs
  // after handling intent
  // https://github.com/actions-on-google/actions-on-google-nodejs/issues/182
  //
  // app.middleware(firestoreSetUserDataMiddleware);
  after.middleware(firestoreUserDataMiddleware.finish);
  after.middleware(pipelineMiddleware.finish);

  // log request
  app.middleware(logRequestMiddleware);

  // log issues
  // https://github.com/actions-on-google/actions-on-google-nodejs/issues/256
  // it is solved but would be useful to know when this problem will be fixed
  app.middleware(logEmptySessionDataMiddleware);

  app.middleware(logSessionDurationMiddleware);

  // compatibility middleware
  // TODO:
  // app.middleware((conv) => {
  //   if (!conv.available.surfaces.capabilities.has('actions.capability.MEDIA_RESPONSE_AUDIO')) {
  //     dialog.close(conv.app, strings.errors.device.mediaResponse);
  //   }
  // });

  app.fallback(async (conv) => {
    debug('handle fallback');
    const matchedHandler = getHandlerByIntent(conv.action);
    if (matchedHandler) {
      debug('doesn\'t match intent name but matched manually by action name');
      return matchedHandler(conv);
    }

    warning(`we missed action: "${conv.action}".
             Intent: "${conv.intent}"`);

    if (unhandledHandler) {
      return unhandledHandler(conv);
    }

    warning('something wrong we don\'t have unhandled handler');
    // the last chance answer if we haven't found unhandled handler
    conv.ask(_.sample(strings.intents.unhandled));
    await after.handle(conv);
  });

  app.catch(async (conv, err) => {
    error('We got unhandled error', err);

    if (err instanceof errors.HTTPError) {
      if (httpRequestErrorHandler) {
        return httpRequestErrorHandler(conv);
      } else {
        return conv.ask(strings.intents.httpRequestError.speech);
      }
    }

    let globalErrorWasHandled = false;
    if (globalErrorHandler) {
      try {
        globalErrorHandler(conv);
        globalErrorWasHandled = true;
      } catch (err) {
        error('error on global error handler', err);
      }
    }

    // last chance to give response to user
    if (!globalErrorWasHandled) {
      conv.ask('Can you rephrase it?');
    }

    await after.handle(conv);
  });
  return functions.https.onRequest(app);
};
