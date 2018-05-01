const playlist = require('../../state/playlist');
const query = require('../../state/query');

const feederFromPlaylist = require('../high-order-handlers/middlewares/feeder-from-playlist');
const fulfilResolvers = require('../high-order-handlers/middlewares/fulfil-resolvers');
const nextSong = require('../high-order-handlers/middlewares/next-song');
const playSongMiddleware = require('../high-order-handlers/middlewares/play-song');
const parepareSongData = require('../high-order-handlers/middlewares/song-data');
const renderSpeech = require('../high-order-handlers/middlewares/render-speech');

/**
 * play one song
 *
 * @param app
 * @param {boolean} next - play next song
 * @returns {Promise}
 */
function playSong ({app, next = false}) {
  return feederFromPlaylist.middleware()({app, query, playlist})
    // expose current platform to the slots
    .then(ctx =>
      Object.assign({}, ctx, {
        slots: Object.assign(
          {}, ctx.slots, {platform: ctx.app.platform || 'assistant'}
        )
      })
    )
    .then(ctx => next ? nextSong()(ctx) : ctx)
    .then(parepareSongData())
    .then(fulfilResolvers())
    .then(renderSpeech())
    .then(playSongMiddleware());
}

module.exports = {
  playSong,
};
