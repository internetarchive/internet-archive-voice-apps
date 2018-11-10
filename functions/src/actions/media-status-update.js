const { debug, warning } = require('../utils/logger')('ia:actions:media-status-update');

const dialog = require('../dialog');
const strings = require('../strings');

const helpers = require('./playback/_helpers');

/**
 * handle 'media status update' action
 *
 * Actions of Google specific intent
 *
 * FIXME: Maybe we should handle this intent this way:
 *
 * https://developers.google.com/actions/assistant/responses
 * > Your Assistant app should handle the actions.intent.MEDIA_STATUS
 * > built-in intent to prompt user for follow-up.
 *
 * @param app
 */
function handler (app) {
  debug('start');

  const { status } = app.params.getByName('MEDIA_STATUS');

  if (status === 'FINISHED') {
    return handleFinished(app);
  } else {
    // log that we got unknown status
    // for example (app.Media.Status.UNSPECIFIED)
    warning(`Got unexpected media update ${status}`);
    return Promise.resolve();
  }
}

/**
 * Handle app.Media.Status.FINISHED media status
 *
 * @param app
 */
function handleFinished (app) {
  debug('handle finished');
  return helpers.playSong({ app, skip: 'forward' })
    .catch(context => {
      debug('It could be an error:', context);
      return dialog.ask(app, strings.events.playlistIsEnded);
    });
}

module.exports = {
  handler,
};
