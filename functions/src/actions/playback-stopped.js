const {debug} = require('../utils/logger')('ia:actions:playback-stopped');

function handler (app) {
  // TODO: log
  debug('index', app.params.getByName('index'));
  debug('token', app.params.getByName('token'));
}

/**
 * handle Alexa AudioPlayer.PlaybackStopped intent
 * @type {{handler: handler}}
 */
module.exports = {
  handler,
};
