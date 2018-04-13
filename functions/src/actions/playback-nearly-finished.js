const {debug} = require('../utils/logger')('ia:actions:playback-nearly-finished');

function handler (app) {
  debug('token', app.params.getByName('token'));
}

/**
 * handle Alexa AudioPlayer.PlaybackNearlyFinished intent
 * @type {{handler: handler}}
 */
module.exports = {
  handler,
};
