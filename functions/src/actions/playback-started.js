const { debug } = require('../utils/logger')('ia:actions:playback-started');

function handler (app) {
  // TODO: set playbackFinished
  // could be useful to resume playback
  // https://github.com/alexa/skill-sample-nodejs-audio-player/blob/1da04690933aab0a2711be6075becf67004a1896/multiple-streams/lambda/src/stateHandlers.js#L83
  debug('token', app.params.getByName('token'));
}

/**
 * handle Alexa AudioPlayer.PlaybackStarted intent
 * @type {{handler: handler}}
 */
module.exports = {
  handler,
};
