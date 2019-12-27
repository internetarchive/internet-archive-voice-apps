const { debug, error, warning } = require('../utils/logger')('ia:actions:media-status-update');

const dialog = require('../dialog');
const playlist = require('../state/playlist');
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

  const mediaStatusParam = app.params.getByName('MEDIA_STATUS');
  const { status } = mediaStatusParam;

  switch (status) {
    case 'FINISHED':
      return handleFinished(app);
    case 'FAILED': {
      const { failureReason } = mediaStatusParam;
      const currentTrack = playlist.getCurrentSong(app);

      // only get such reason: 'AUDIO_NOT_PLAYABLE'
      warning(`Failure reason: "${failureReason}" for track ${currentTrack.audioURL}`);
      return dialog.close(app, strings.events.playlistIsEnded);
    }
    default:
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
  if (app.persist.isEmpty() || !playlist.getFeeder(app)) {
    error('something really strange we got end of music track but user\'s session is empty');
    // we are going to play short sample to hope that next time we would get session back
    dialog.playSong(app, {
      mediaResponseOnly: true,
      audioURL: 'https://s3.amazonaws.com/gratefulerrorlogs/CrowdNoise.mp3',
    });
    return Promise.resolve();
  }

  return helpers.playSong({ app, skip: 'forward' })
    .catch(context => {
      debug('It could be an error:', context);
      return dialog.ask(app, strings.events.playlistIsEnded);
    });
}

module.exports = {
  handler,
};
