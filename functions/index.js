'use strict';

const DialogflowApp = require('actions-on-google').DialogflowApp;
const functions = require('firebase-functions');
const bst = require('bespoken-tools');
const dashbot = require('dashbot')(
  functions.config().dashbot.key, {
    printErrors: false,
  }).google;

const {defaultActions} = require('./src/actions');
const dialog = require('./src/dialog');
const setup = require('./src/setup');
const {storeAction} = require('./src/state/actions');
const strings = require('./src/strings');
const {debug, warning} = require('./src/utils/logger')('ia:index');
const logAppStart = require('./src/utils/logger/log-app-start');
const logRequest = require('./src/utils/logger/log-request');

const actionsMap = defaultActions();

logAppStart(actionsMap);

setup();

/**
 * Action Endpoint
 *
 * @type {HttpsFunction}
 */
exports.playMedia = functions.https.onRequest(bst.Logless.capture(functions.config().bespoken.key, function (req, res) {
  const app = new DialogflowApp({request: req, response: res});

  logRequest(app, req);

  storeAction(app, app.getIntent());

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
