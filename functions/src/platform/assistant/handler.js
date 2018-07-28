const {dialogflow} = require('actions-on-google');
const bst = require('bespoken-tools');
const functions = require('firebase-functions');
const _ = require('lodash');
// const dashbotBuilder = require('dashbot');
// FIXME: temporal solution details below
// const domain = require('domain'); // eslint-disable-line
const Raven = require('raven');

const packageJSON = require('../../../package.json');

const strings = require('../../strings');
const {debug, error, warning} = require('../../utils/logger')('ia:index');

const buildHandlers = require('./handler/builder');
const logRequest = require('./middlewares/log-request');

module.exports = (actionsMap) => {
  const app = dialogflow();
  let handlers = [];

  // dashbot doesn't support official v2 yet
  // (https://github.com/actionably/dashbot/issues/23)
  //
  // const dashbot = dashbotBuilder(
  //   functions.config().dashbot.key, {
  //     printErrors: false,
  //   }).google;

  if (actionsMap) {
    handlers = buildHandlers({actionsMap});
    handlers.forEach(
      ({intent, handler}) => app.intent(intent, handler)
    );
  }

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

  const getHandlerByName = name => handlers.filter(h => h.intent === name);

  app.fallback((conv) => {
    let matchedHandlers = getHandlerByName(conv.action);
    if (matchedHandlers.length > 0) {
      debug(`doesn't match intent name but matched manually by action name`);
      return matchedHandlers[0].handler(conv);
    }

    warning(`we missed action: "${conv.action}".
             Intent: "${conv.intent}"`);

    matchedHandlers = getHandlerByName('unhandled');
    if (matchedHandlers.length > 0) {
      return matchedHandlers[0].handler(conv);
    }

    warning(`something wrong we don't have unhandled handler`);
    // the last chance answer if we haven't found unhandled handler
    conv.ask(_.sample(strings.intents.unhandled));
  });

  app.catch((conv, err) => {
    error('We got unhandled error', err);
    if (conv.raven) {
      conv.raven.captureException(err);
    }

    conv.ask(`Can you rephrase it?`);
  });

  return functions.https.onRequest(bst.Logless.capture(functions.config().bespoken.key, app));
};
