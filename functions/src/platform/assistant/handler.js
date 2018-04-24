const {dialogflow} = require('actions-on-google');
const bst = require('bespoken-tools');
const functions = require('firebase-functions');
// const dashbotBuilder = require('dashbot');
// FIXME: temporal solution details below
// const domain = require('domain'); // eslint-disable-line
const Raven = require('raven');

const packageJSON = require('../../../package.json');

const {storeAction} = require('./../../state/actions');
const {error, warning} = require('./../../utils/logger')('ia:index');

const {App} = require('./app');
const buildHandlers = require('./handler/builder');
const logRequest = require('./middlewares/log-request');

module.exports = (actionsMap) => {
  const app = dialogflow();

  // dashbot doesn't support official v2 yet
  // (https://github.com/actionably/dashbot/issues/23)
  //
  // const dashbot = dashbotBuilder(
  //   functions.config().dashbot.key, {
  //     printErrors: false,
  //   }).google;

  if (actionsMap) {
    buildHandlers({actionsMap})
      .forEach(
        ({intent, handler}) => app.intent(intent, handler)
      );
  }

  app.middleware((conv) => {
    conv.app = new App(conv);
  });

  // Sentry middleware
  if (functions.config().sentry) {
    app.middleware((conv) => {
      conv.raven = Raven.Client();
      conv.raven.config(
        functions.config().sentry.url, {
          sendTimeout: 10,
          captureUnhandledRejections: true,
          release: packageJSON.version,
          tags: {
            platform: 'assistant',
          }
        }
      ).install();

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
  //     dialog.tell(conv.app, strings.errors.device.mediaResponse);
  //   }
  // });

  app.middleware((conv) => {
    storeAction(conv.app, conv.action);
  });

  app.fallback((conv) => {
    // TODO: move to actions
    // warning(`We missed action: "${app.getIntent()}".
    warning(`We missed action: "${conv.action}".
             Intent: "${conv.intent}"`);

    conv.ask(`Can you rephrase it?`);
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
