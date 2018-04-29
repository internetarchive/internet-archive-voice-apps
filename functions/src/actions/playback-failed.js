const playlist = require('../state/playlist');
const {warning} = require('../utils/logger')('ia:actions:playback-failed');

/**
 * handle playback failed request
 *
 * @param app
 */
function handler(app) {
  const e = app.getRequestError();
  const currentTrack = playlist.getCurrentSong(app);

  warning(`Fail to playback ${currentTrack.audioUrl} with ${e.type}: "${e.message}"`);
}

module.exports = {
  handler,
};
