const dialog = require('../dialog');
const playlist = require('../state/playlist');
const strings = require('../strings');
const { debug, warning } = require('../utils/logger')('ia:actions:playback-failed');

const helpers = require('./playback/_helpers');

/**
 * handle playback failed request
 *
 * @param app
 */
function handler (app) {
  const e = app.getRequestError() || {};
  const currentTrack = playlist.getCurrentSong(app);

  warning(`Fail to playback ${currentTrack.audioURL} with ${e.type}: "${e.message}"`);

  return helpers.playSong({ app, skip: 'forward' })
    .catch(e => {
      debug('It could be an error:', e);
      return dialog.ask(app, strings.events.playlistIsEnded);
    });
}

module.exports = {
  handler,
};
