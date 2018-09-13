const {dialogflow} = require('actions-on-google');
// const {dialogflow, BasicCard, SimpleResponse} = require('actions-on-google')
const bst = require('bespoken-tools');
const functions = require('firebase-functions');
const _ = require('lodash');
const dashbotBuilder = require('dashbot');

// FIXME: temporal solution details below
// const domain = require('domain'); // eslint-disable-line
const Raven = require('raven');

const packageJSON = require('../../../package.json');

const errors = require('../../errors');
const pipeline = require('../../performance/pipeline');
const strings = require('../../strings');
const {debug, error, warning} = require('../../utils/logger')('ia:index');

const buildHandlers = require('./handler/builder');
const logRequest = require('./middlewares/log-request');

module.exports = (actionsMap) => {
  const app = dialogflow();
  let handlers = [];

  const dashbot = dashbotBuilder(
    functions.config().dashbot.key, {
      printErrors: false,
    }).google;

  if (actionsMap) {
    handlers = buildHandlers({actionsMap});
    handlers.forEach(
      ({intent, handler}) => app.intent(intent, handler)
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

  // log request
  app.middleware(logRequest);

  // compatability middleware
  // TODO:
  // app.middleware((conv) => {
  //   if (!conv.available.surfaces.capabilities.has('actions.capability.MEDIA_RESPONSE_AUDIO')) {
  //     dialog.close(conv.app, strings.errors.device.mediaResponse);
  //   }
  // });

  app.fallback((conv) => {
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
    pipeline.stage(pipeline.IDLE);
  });

  // dashbot.configHandler(app);

  return functions.https.onRequest(bst.Logless.capture(functions.config().bespoken.key, app), (req, res) => {
    dashbot.configHandler(app);
  });
};
