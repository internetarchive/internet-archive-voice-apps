const DialogflowApp = require('actions-on-google').DialogflowApp;
const functions = require('firebase-functions');
const bst = require('bespoken-tools');
const dashbotBuilder = require('dashbot');
const Raven = require('raven');

const dialog = require('./../../dialog');
const {storeAction} = require('./../../state/actions');
const strings = require('./../../strings');
const {debug, warning} = require('./../../utils/logger')('ia:index');
const logRequest = require('./../../utils/logger/log-request');

module.exports = (actionsMap) => {
  const dashbot = dashbotBuilder(
    functions.config().dashbot.key, {
      printErrors: false,
    }).google;

  let useRaven = false;
  if (functions.config().sentry) {
    debug('install sentry (raven)');
    Raven.config(
      functions.config().sentry.url
    ).install();
    useRaven = true;
  }

  return functions.https.onRequest(bst.Logless.capture(functions.config().bespoken.key, function (req, res) {
    const app = new DialogflowApp({request: req, response: res});

    logRequest(app, req);

    storeAction(app, app.getIntent());

    if (useRaven) {
      // set user's context to Sentry
      Raven.context(() => {
        Raven.setContext({
          user: {
            id: app.getUser() && app.getUser().userId,
          }
        });
      });
    }

    // it seems pre-flight request from google assistant,
    // we shouldn't handle it by actions
    if (!req.body || !app.getIntent()) {
      debug('we get empty body. so we ignore request');
      app.ask('Internet Archive is here!');
      return;
    }

    if (app.hasSurfaceCapability(app.SurfaceCapabilities.MEDIA_RESPONSE_AUDIO)) {
      app.handleRequestAsync(actionsMap)
        .catch(err => {
          warning(`We missed action: "${app.getIntent()}".
                 And got an error:`, err);
        });
    } else {
      dialog.tell(app, strings.errors.device.mediaResponse);
    }

    dashbot.configHandler(app);
  }));
};
