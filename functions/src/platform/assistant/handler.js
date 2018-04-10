const DialogflowApp = require('actions-on-google').DialogflowApp;
const functions = require('firebase-functions');
const bst = require('bespoken-tools');
const dashbotBuilder = require('dashbot');
// FIXME: temporal solution details below
const domain = require('domain'); // eslint-disable-line
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

  return functions.https.onRequest(bst.Logless.capture(functions.config().bespoken.key, function (req, res) {
    let raven;

    try {
      // FIXME:
      //
      // @hyzhak:
      //
      // for some reason inside of google functions
      // (I can't reproduce this issue in local envirompoent npm start)
      // domain.active is defined
      // but it will become undefined once we got rejection
      // what breaks Sentry because we loose context
      //
      // I haven't found yet who and why use domain
      // maybe we don't need it at all
      // so temporal fix is just disable it
      domain.active = null;

      const app = new DialogflowApp({request: req, response: res});
      if (functions.config().sentry) {
        raven = app.raven = Raven.Client();
        app.raven.config(
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

      if (app.raven) {
        // set user's context to Sentry
        app.raven.setContext({
          user: {
            id: app.getUser() && app.getUser().userId,
          }
        });

        // action context
        app.raven.captureBreadcrumb({
          category: 'handle',
          message: 'Handling of request',
          level: 'info',
          data: {
            capabilities: app.getSurfaceCapabilities(),
            sessionData: app.data,
          },
        });
      }

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

            if (app.raven) {
              app.raven.captureException(err);
            }
          });
      } else {
        dialog.tell(app, strings.errors.device.mediaResponse);
      }

      dashbot.configHandler(app);
    } catch (e) {
      if (raven) {
        raven.captureException(e);
      }
    }
  }));
};
