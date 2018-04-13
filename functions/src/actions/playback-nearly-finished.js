const dialog = require('../dialog');
const playlist = require('../state/playlist');
const strings = require('../strings');
const {debug} = require('../utils/logger')('ia:actions:playback-nearly-finished');

const playSong = require('./high-order-handlers/middlewares/play-song');
const {prepareNextSong} = require('./media-status-update');

function handler (app) {
  debug('token', app.params.getByName('token'));
  const previousTrack = playlist.getCurrentSong(app);
  // enqueue song to the playlist
  return prepareNextSong({app, slots: {previousTrack}})
    // for the moment this handler works for Alexa only
    // Alexa doesn't allow any response except of media response
    .then(playSong({mediaResponseOnly: true}))
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
