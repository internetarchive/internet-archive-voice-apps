const {debug} = require('../utils/logger')('ia:actions:playback-stopped');

const playback = require('../state/playback');

function handler (app) {
  const offset = app.getOffset();
  debug('offset', offset);
  playback.setOffset(app, offset);
}

/**
 * handle Alexa AudioPlayer.PlaybackStopped intent
 * @type {{handler: handler}}
 */
module.exports = {
  handler,
};
