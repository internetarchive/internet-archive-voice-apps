const DialogflowApp = require('actions-on-google').DialogflowApp;
const functions = require('firebase-functions');
const bst = require('bespoken-tools');
const dashbotBuilder = require('dashbot');
const Raven = require('raven');

const packageJSON = require('../../../package.json');

const dialog = require('./../../dialog');
const {storeAction} = require('./../../state/actions');
const strings = require('./../../strings');
const {debug, warning} = require('./../../utils/logger')('ia:index');
const logRequest = require('./../../utils/logger/log-request');

const which = require('../which');

module.exports = (actionsMap) => {
  const dashbot = dashbotBuilder(
    functions.config().dashbot.key, {
      printErrors: false,
    }).google;

  if (functions.config().sentry) {
    debug('install sentry (raven)');
    Raven.config(
      functions.config().sentry.url, {
        sendTimeout: 10,
        captureUnhandledRejections: true,
        release: packageJSON.version,
        tags: {
          platform: which(),
        }
      }
    ).install();
  }

  return functions.https.onRequest(bst.Logless.capture(functions.config().bespoken.key, function (req, res) {
    try {
      const app = new DialogflowApp({request: req, response: res});

      // set user's context to Sentry
      Raven.setContext({
        user: {
          id: app.getUser() && app.getUser().userId,
        }
      });

      // action context
      Raven.captureBreadcrumb({
        category: 'handle',
        message: 'Handling of request',
        level: 'info',
        data: {
          capabilities: app.getSurfaceCapabilities(),
          sessionData: app.data,
        },
      });

      logRequest(app, req);

      storeAction(app, app.getIntent());

      // it seems pre-flight request from google assistant,
      // we shouldn't handle it by actions
      if (!req.body || !app.getIntent()) {
        debug('we get empty body. so we ignore request');
        app.ask('Internet Archive is here!');
        throw new Error('TEST: Internet Archive is here!');
      }

      if (app.hasSurfaceCapability(app.SurfaceCapabilities.MEDIA_RESPONSE_AUDIO)) {
        app.handleRequestAsync(actionsMap)
          .catch(err => {
            warning(`We missed action: "${app.getIntent()}".
                   And got an error:`, err);

            Raven.captureException(err);
          });
      } else {
        dialog.tell(app, strings.errors.device.mediaResponse);
      }

      dashbot.configHandler(app);
    } catch (e) {
      Raven.captureException(e);
    }
  }));
};
