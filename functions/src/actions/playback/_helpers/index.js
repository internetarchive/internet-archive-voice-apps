const dialog = require('../../../dialog');
const constants = require('../../../constants');
const dialogState = require('../../../state/dialog');
const fsm = require('../../../state/fsm');
const playback = require('../../../state/playback');
const playlist = require('../../../state/playlist');
const query = require('../../../state/query');
const strings = require('../../../strings');
const { debug } = require('../../../utils/logger')('ia:actions:playback/_helpers');

const defaultHelper = require('../../_helpers');
const feederFromPlaylist = require('../../_middlewares/feeder-from-playlist');
const fulfilResolvers = require('../../_middlewares/fulfil-resolvers');
const { rewindToTheFirstSong } = require('../../_middlewares/rewind-to-the-first-song');
const { rewindToTheLastSong } = require('../../_middlewares/rewind-to-the-last-song');
const { nextSong, DoNotHaveNextSongError } = require('../../_middlewares/next-song');
const mapPlatformToSlots = require('../../_middlewares/map-platform-to-slots');
const playSongMiddleware = require('../../_middlewares/play-song');
const { previousSong, DoNotHavePreviousSongError } = require('../../_middlewares/previous-song');
const renderSpeech = require('../../_middlewares/render-speech');
const { mapSongDataToSlots } = require('../../_middlewares/song-data');
const { storeCurrentSongDataInContext } = require('../../_middlewares/store-current-song-data-in-context');

/**
 * map skip name to skip behaviour
 *
 * @type {{back: *, forward: *}}
 */
const skipHandlers = {
  'to-the-first': rewindToTheFirstSong(),
  back: previousSong(),
  forward: nextSong(),
  'to-the-last': rewindToTheLastSong(),
};

/**
 * Enqueue next record without moving to the next playlist item
 *
 * @param ctx
 * @returns {Promise}
 */
function enqueue (ctx) {
  return feederFromPlaylist.middleware()({
    ...ctx,
    playlist,
    query,
  })
    .then(mapPlatformToSlots())
    .then(ctx => ({
      ...ctx,
      slots: {
        ...ctx.slots,
        previousTrack: playlist.getCurrentSong(ctx.app),
      },
    }))
    .then(nextSong({
      // we need just fetch next song,
      // and on AMAZON.StartIntent we finally move there
      move: false,
    }))
    .then(mapSongDataToSlots({
      // map next (enqueued) song
      type: 'next',
    }))
    .then(fulfilResolvers())
    .then(renderSpeech())
    .then(playSongMiddleware({
      // Alexa doesn't allow any response except of media response
      // when we add to queue
      mediaResponseOnly: true,
    }));
}

/**
 * play one song
 *
 * @param ctx
 * @param {string} ctx.skip - skip back, forward
 * @returns {Promise}
 */
function playSong (ctx) {
  debug('playSong');
  debug(ctx);
  const { skip = null } = ctx;
  return feederFromPlaylist.middleware()({ ...ctx, query, playlist })
    .then(storeCurrentSongDataInContext())
    .then(mapPlatformToSlots())
    .then(ctx => {
      if (skip) {
        return skipHandlers[skip](ctx);
      }
      return ctx;
    })
    .then(mapSongDataToSlots())
    .then(fulfilResolvers())
    .then(renderSpeech())
    // Alexa doesn't allow any response except of media response
    .then(playSongMiddleware(ctx))
    .catch(err => {
      const { app } = ctx;
      if (err instanceof DoNotHavePreviousSongError) {
        debug('playlist is ending (from begin)');
        fsm.transitionTo(app, constants.fsm.states.PLAYLIST_IS_ENDED_FROM_BEGIN);
        return defaultHelper.simpleResponse(app, strings.events.playlistIsEndedFromBegin);
      }
      if (err instanceof DoNotHaveNextSongError) {
        debug('playlist is ending (from end)');
        fsm.transitionTo(app, constants.fsm.states.PLAYLIST_IS_ENDED);
        return defaultHelper.simpleResponse(app, strings.events.playlistIsEnded);
      }
      return Promise.reject(err);
    });
}

/**
 * resume track playback
 *
 * @param ctx
 * @returns {Promise.<T>}
 */
function resume (ctx) {
  debug('resume');
  return playSong(Object.assign({}, ctx, {
    offset: playback.getOffset(ctx.app),
    skip: null
  }))
    .catch(err => {
      if (err instanceof feederFromPlaylist.EmptyFeederError) {
        debug('playlist is empty');
        dialog.ask(ctx.app, dialog.merge(
          strings.intents.resume.empty,
          dialogState.getReprompt(ctx.app)
        ));
      } else {
        debug('it could be an error:', err);
        return dialog.ask(ctx.app, dialog.merge(
          strings.intents.resume.fail,
          dialogState.getReprompt(ctx.app)
        ));
      }
    });
}

function simpleResponseAndResume (app, scheme, extra = {}, defaultResponse = {}) {
  defaultHelper.simpleResponse(app, scheme, extra, defaultResponse);
  return resume({ app });
}

module.exports = {
  enqueue,
  playSong,
  resume,
  simpleResponseAndResume,
};
