const dialog = require('../../dialog');
const strings = require('../../strings');
const { debug } = require('../../utils/logger')('ia:actions:next');

const helpers = require('./_helpers');

/**
 * handle playback previous song request
 *
 * @param app
 */
function handler (app) {
  const requestType = app.params.getByName('type');
  const isPlaybackController = typeof requestType === 'string' &&
    requestType.startsWith('PlaybackController.');
  // Only suppress speech for PlaybackController events (where speech is forbidden).
  // For voice intents (AMAZON.PreviousIntent), include speech to keep the session alive
  // so subsequent voice commands continue routing to the skill.
  const mediaResponseOnly = isPlaybackController;

  return helpers.playSong({ app, skip: 'back', mediaResponseOnly })
    .catch(e => {
      debug('It could be an error:', e);
      if (mediaResponseOnly) {
        app.stopPlayback();
        return null;
      }
      return dialog.ask(app, strings.events.playlistIsEnded);
    });
}

module.exports = {
  handler,
};
