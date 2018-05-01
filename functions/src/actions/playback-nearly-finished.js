const dialog = require('../dialog');
const strings = require('../strings');
const {debug} = require('../utils/logger')('ia:actions:playback-nearly-finished');

const helpers = require('./playback/_helpers');

function handler (app) {
  return helpers.playSong({
    app,
    mediaResponseOnly: true,
    next: true,
  })
    .catch(context => {
      debug('It could be an error:', context);
      return dialog.ask(app, strings.events.playlistIsEnded);
    });
}

/**
 * handle Alexa AudioPlayer.PlaybackNearlyFinished intent
 * @type {{handler: handler}}
 */
module.exports = {
  handler,
};
