const _ = require('lodash');

const dialog = require('../../dialog');
const dialogState = require('../../state/dialog');
const playlist = require('../../state/playlist');
const query = require('../../state/query');
const strings = require('../../strings');
const {debug} = require('../../utils/logger')('ia:actions:playback/_helpers');

const feederFromPlaylist = require('../_high-order-handlers/middlewares/feeder-from-playlist');
const fulfilResolvers = require('../_high-order-handlers/middlewares/fulfil-resolvers');
const nextSong = require('../_high-order-handlers/middlewares/next-song');
const playSongMiddleware = require('../_high-order-handlers/middlewares/play-song');
const parepareSongData = require('../_high-order-handlers/middlewares/song-data');
const renderSpeech = require('../_high-order-handlers/middlewares/render-speech');

/**
 * play one song
 *
 * @param app
 * @param {boolean} mediaResponseOnly - alexa doesn't allow any response except of media response
 * @param {boolean} enqueue - add next song in the queue (we should pass previous track)
 * @param {boolean} next - play next song
 * @returns {Promise}
 */
function playSong (opts) {
  const {app, enqueue = false, next = false} = opts;
  return feederFromPlaylist.middleware()({app, query, playlist})
    // expose current platform to the slots
    .then(ctx =>
      Object.assign({}, ctx, {
        slots: Object.assign(
          {}, ctx.slots, {platform: ctx.app.platform || 'assistant'}
        )
      })
    )
    .then(ctx => {
      if (next) {
        // we need previous track token for Alexa playback
        if (enqueue) {
          const previousTrack = playlist.getCurrentSong(ctx.app);
          ctx = Object.assign({}, ctx);
          _.set(ctx, ['slots', 'previousTrack'], previousTrack);
        }
        return nextSong()(ctx);
      }
      return ctx;
    })
    .then(parepareSongData())
    .then(fulfilResolvers())
    .then(renderSpeech())
    // Alexa doesn't allow any response except of media response
    .then(playSongMiddleware(opts));
}

/**
 * resume track playback
 *
 * @param app
 * @returns {Promise.<T>}
 */
function resume ({app}) {
  return playSong({app, next: false})
    .catch(err => {
      if (err instanceof feederFromPlaylist.EmptyFeederError) {
        dialog.ask(app, dialog.merge(
          strings.intents.resume.empty,
          dialogState.getReprompt(app)
        ));
      } else {
        debug('It could be an error:', err);
        return dialog.ask(app, dialog.merge(
          strings.intents.resume.fail,
          dialogState.getReprompt(app)
        ));
      }
    });
}

module.exports = {
  playSong,
  resume,
};
