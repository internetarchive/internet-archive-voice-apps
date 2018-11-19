const mustache = require('mustache');

const config = require('../../config');
const songsProvider = require('../../provider/songs');
const { debug } = require('../../utils/logger')('ia:feeder:default');
const rebornEscape = require('../../utils/reborn-escape');

const { orders, DEFAULT_ORDER } = require('../orders');

class DefaultFeeder {
  build ({ app, query, playlist }) {
    throw new Error('Not Implemented!');
  }

  /**
   * Do we have any songs here?
   *
   * @param slots
   * @param playlist
   * @returns {boolean}
   */
  isEmpty ({ app, slots, playlist }) {
    return playlist.isEmpty(app);
  }

  /**
   * Current item of feeder
   *
   * @param app
   * @param playlist
   * @returns {{id: string, title: string}}
   */
  getCurrentItem ({ app, playlist }) {
    return playlist.getCurrentSong(app);
  }

  getNextItem (ctx) {
    const { app, query } = ctx;
    const orderStrategy = orders.getByName(
      query.getSlot(app, 'order') || DEFAULT_ORDER
    );
    return orderStrategy.getNextItem(ctx);
  }

  /**
   * Do we have previous item?
   *
   * @param app
   * @param slots
   * @param playlist
   * @returns {boolean}
   */
  hasPrevious ({ app, playlist, query, slots }) {
    if (playlist.isLoop(app)) {
      return true;
    }

    // always have something when songs in shuffle
    if (query.getSlot(app, 'order') === 'random') {
      return true;
    }

    return playlist.hasPreviousSong(app);
  }

  /**
   * Do we have next item?
   *
   * @param app
   * @param slots
   * @param playlist
   * @returns {boolean}
   */
  hasNext (ctx) {
    const { app, query, playlist } = ctx;
    if (playlist.isLoop(app)) {
      return true;
    }

    // always have something when songs in shuffle
    if (query.getSlot(app, 'order') === 'random') {
      return true;
    }

    return playlist.hasNextSong(app);
  }

  /**
   * Rewind to the first song
   *
   * @param ctx
   * @returns {*}
   */
  first (ctx) {
    const { app, playlist } = ctx;
    playlist.first(app);
    return Promise.resolve(ctx);
  }

  /**
   * Move to the next song
   *
   * TODO: should be async because we could have multiple albums here
   *
   * @param ctx
   * @param move
   * @returns {Promise.<T>}
   */
  next (ctx, move = true) {
    const { app, playlist } = ctx;
    if (move) {
      debug('move to the next song');
      playlist.next(app);
    }
    return Promise.resolve(ctx);
  }

  /**
   * Move to the previous song
   *
   * TODO: should be async because we could have multiple albums here
   *
   * @returns {Promise.<T>}
   */
  previous (ctx) {
    const { app, playlist } = ctx;
    debug('move to the previous song');
    playlist.previous(app);
    return Promise.resolve(ctx);
  }

  /**
   * Rewind to the last song
   *
   * @param ctx
   * @returns {*}
   */
  last (ctx) {
    const { app, playlist } = ctx;
    playlist.last(app);
    return Promise.resolve(ctx);
  }

  /**
   * Process album songs
   *
   * @protected
   * @param album
   * @returns {Array}
   */
  processAlbumSongs (album) {
    return album.songs
      .map((song, idx) => Object.assign({}, song, {
        audioURL: songsProvider.getSongUrlByAlbumIdAndFileName(
          album.id, rebornEscape(song.filename)),
        collections: album.collections,
        coverage: album.coverage,
        creator: album.creator,
        imageURL: mustache.render(config.media.POSTER_OF_ALBUM, album),
        // TODO : add recommendations
        suggestions: ['Next'],
        album: {
          id: album.id,
          title: album.title,
        },
        track: idx + 1,
        year: album.year,
      }));
  }
}

module.exports = DefaultFeeder;
