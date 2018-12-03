const { dialogflow } = require('actions-on-google');
const bst = require('bespoken-tools');
const dashbotBuilder = require('dashbot');
const functions = require('firebase-functions');
const _ = require('lodash');
const Raven = require('raven');

const packageJSON = require('../../../package.json');

const errors = require('../../errors');
const pipeline = require('../../performance/pipeline');
const strings = require('../../strings');
const { debug, error, warning } = require('../../utils/logger')('ia:index');

const buildHandlers = require('./handler/builder');
const dbConnector = require('./firestore').firestore;
const after = require('./middlewares/after');
const firestoreGetUserDataMiddleware = require('./middlewares/firestore-get-user-data');
const firestoreSetUserDataMiddleware = require('./middlewares/firestore-set-user-data');
const logRequestMiddleware = require('./middlewares/log-request');
const userUIDMiddleware = require('./middlewares/user-uid');

module.exports = (actionsMap) => {
  const app = dialogflow();

  const dashbot = dashbotBuilder(functions.config().dashbot.key, {
    // it could be more useful if we would get callback on error and pass log through our logger
    // but currently it uses console.log to log error
    //
    // more details in source:
    // https://github.com/actionably/dashbot/blob/33376ff81af3962eb58ad8ebabc91827134333c5/src/make-request.js#L22
    //
    printErrors: false,
  }).google;

  dashbot.configHandler(app);

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

  app.middleware(() => {
    pipeline.stage(pipeline.PROCESS_REQUEST);
  });

  // Sentry middleware
  if (functions.config().sentry) {
    app.middleware((conv) => {
      conv.raven = Raven.Client(
        functions.config().sentry.url, {
          sendTimeout: 10,
          captureUnhandledRejections: true,
          release: packageJSON.version,
          tags: {
            platform: 'assistant',
          }
        }
      );
      conv.raven.install();

      // set user's context to Sentry
      conv.raven.setContext({
        user: conv.user,
      });

      // action context
      conv.raven.captureBreadcrumb({
        category: 'handle',
        message: 'Handling of request',
        level: 'info',
        data: {
          capabilities: conv.available.surfaces.capabilities,
          sessionData: conv.user.storage,
        },
      });
    });
  }

  const db = dbConnector.connect();

  // prepare user's data
  app.middleware(userUIDMiddleware);

  // fetch user's data from firestore
  app.middleware(firestoreGetUserDataMiddleware(db));

  // TODO: fix, once it would be official supported
  // for the moment action on google api doesn't support
  // middleware which should runs
  // after handling intent
  // https://github.com/actions-on-google/actions-on-google-nodejs/issues/182
  //
  // app.middleware(firestoreSetUserDataMiddleware);
  after.middleware(firestoreSetUserDataMiddleware(db));

  // log request
  app.middleware(logRequestMiddleware);

  // compatibility middleware
  // TODO:
  // app.middleware((conv) => {
  //   if (!conv.available.surfaces.capabilities.has('actions.capability.MEDIA_RESPONSE_AUDIO')) {
  //     dialog.close(conv.app, strings.errors.device.mediaResponse);
  //   }
  // });

  app.fallback((conv) => {
    debug('handle fallback');
    let matchedHandler = getHandlerByIntent(conv.action);
    if (matchedHandler) {
      debug(`doesn't match intent name but matched manually by action name`);
      return matchedHandler(conv);
    }

    warning(`we missed action: "${conv.action}".
             Intent: "${conv.intent}"`);

    if (unhandledHandler) {
      return unhandledHandler(conv);
    }

    warning(`something wrong we don't have unhandled handler`);
    // the last chance answer if we haven't found unhandled handler
    conv.ask(_.sample(strings.intents.unhandled));
    after.handle(conv);
    pipeline.stage(pipeline.IDLE);
  });

  app.catch((conv, err) => {
    error('We got unhandled error', err);
    if (conv.raven) {
      conv.raven.captureException(err);
    }

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
        if (conv.raven) {
          conv.raven.captureException(err);
        }
      }
    }

    // last chance to give response to user
    if (!globalErrorWasHandled) {
      conv.ask(`Can you rephrase it?`);
    }
    after.handle(conv);
    pipeline.stage(pipeline.IDLE);
  });

  return functions.https.onRequest(bst.Logless.capture(functions.config().bespoken.key, app));
};
