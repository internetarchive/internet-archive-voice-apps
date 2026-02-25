const dialog = require('../../dialog');
const strings = require('../../strings');
const { debug, error } = require('../../utils/logger')('ia:actions:next');

const skippedSong = require('../../metrics/skipped-song');

const helpers = require('./_helpers');

/**
 * handle playback next song request
 *
 * @param app
 */
function handler(app) {
  const requestType = app.params.getByName('type');
  const playerActivity = app.handlerInput &&
    app.handlerInput.requestEnvelope &&
    app.handlerInput.requestEnvelope.context &&
    app.handlerInput.requestEnvelope.context.AudioPlayer &&
    app.handlerInput.requestEnvelope.context.AudioPlayer.playerActivity;
  const isPlaybackController = typeof requestType === 'string' &&
    requestType.startsWith('PlaybackController.');
  // Only suppress speech for PlaybackController events (where speech is forbidden).
  // For voice intents (AMAZON.NextIntent), include speech to keep the session alive
  // so subsequent "Alexa next/skip" commands continue routing to the skill.
  const mediaResponseOnly = isPlaybackController;

  debug('Request type:', requestType);
  debug('Is PlaybackController:', isPlaybackController);
  debug('mediaResponseOnly:', mediaResponseOnly);
  debug('Player activity:', playerActivity);

  return helpers.playSong({ app, skip: 'forward', mediaResponseOnly })
    .then((res) => {
      const { currentSongData } = res || {};
      if (res && !currentSongData) {
        error('We do not have any data for previous song');
      } else if (res) {
        return skippedSong(app, {
          albumId: currentSongData.album.id,
          filename: currentSongData.filename
        });
      }
    })
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
