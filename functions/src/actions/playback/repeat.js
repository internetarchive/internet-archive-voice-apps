const {debug} = require('../../utils/logger')('ia:actions:playback/repeat');

const dialog = require('../../dialog');
const playlist = require('../../state/playlist');
const query = require('../../state/query');
const strings = require('../../strings');

const feederFromPlaylist = require('../high-order-handlers/middlewares/feeder-from-playlist');
const fulfilResolvers = require('../high-order-handlers/middlewares/fulfil-resolvers');
const playSong = require('../high-order-handlers/middlewares/play-song');
const parepareSongData = require('../high-order-handlers/middlewares/song-data');
const renderSpeech = require('../high-order-handlers/middlewares/render-speech');

/**
 * handle repeat intent
 *
 * @param app
 */
function handler (app) {
  return feederFromPlaylist()({app, query, playlist})
    // expose current platform to the slots
    .then(ctx =>
      Object.assign({}, ctx, {
        slots: Object.assign(
          {}, ctx.slots, {platform: ctx.app.platform || 'assistant'}
        )
      })
    )
    // we need current song
    // .then(nextSong())
    .then(parepareSongData())
    .then(fulfilResolvers())
    .then(renderSpeech())
    .then(playSong())
    .catch(context => {
      debug('It could be an error:', context);
      return dialog.ask(app, strings.intents.repeat.empty);
    });
}

module.exports = {
  handler,
};
