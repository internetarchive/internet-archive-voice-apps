const dialog = require('../dialog');
const strings = require('../strings');
const { debug } = require('../utils/logger')('ia:actions:playback-nearly-finished');

const helpers = require('./playback/_helpers');

function handler (app) {
  return helpers.enqueue({ app })
    .catch((err) => {
      debug('It could be an error:', err);
      return dialog.ask(app, strings.events.playlistIsEnded);
    });
  // return helpers.playSong({
  //   app,
  //   mediaResponseOnly: true,
  //   skip: 'forward',
  //   enqueue: true,
  // })
  //   .catch(context => {
  //     debug('It could be an error:', context);
  //     return dialog.ask(app, strings.events.playlistIsEnded);
  //   });
}

/**
 * handle Alexa AudioPlayer.PlaybackNearlyFinished intent
 * @type {{handler: handler}}
 */
module.exports = {
  handler,
};
