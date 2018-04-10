/**
 * Async Albums feeder
 * it fetches data on-demand
 *
 * pros:
 * - memory (user's state) efficient, because loads only needed songs
 * - could deal with very large of unlimited list of songs
 *
 * cons:
 * - could have delay on songs swapping
 * - could lack of information about real size of playlist
 *
 */

const _ = require('lodash');

const config = require('../../config');
const albumsProvider = require('../../provider/albums');
const {debug, warning, error} = require('../../utils/logger')('ia:feeder:albums-async');
const stripFileName = require('../../utils/strip-filename');

const orderStrategies = require('../orders');

const DefaultFeeder = require('./_default');

const defaultCursor = {
  current: {
    album: 0,
    song: 0,
  },

  total: {
    albums: 0,
    songs: 0,
  },
};

/**
 * name of feeder
 */
const feederName = stripFileName(__filename);

class AsyncAlbums extends DefaultFeeder {
  /**
   * Prefetch some songs from albums
   * and update playlist
   *
   * @param app
   * @param query
   * @param playlist
   * @returns {Promise}
   */
  build ({app, query, playlist}) {
    debug('build async songs feeder');

    return this.fetchChunkOfSongs({app, query, playlist})
      .then(({songs, songsInFirstAlbum, totalNumOfAlbums}) => {
        // the only place where we modify state
        // so maybe we can put it out of this function?
        debug(`let's create playlist for songs`);
        playlist.create(app, songs, {
          cursor: Object.assign({}, defaultCursor, {
            total: {
              songs: songsInFirstAlbum,
              albums: totalNumOfAlbums,
            },
          }),
        });
        return {total: totalNumOfAlbums};
      });
  }

  /**
   * Fetch chunk of songs
   *
   * @private
   * @param app
   * @param query
   * @param playlist
   * @returns {Promise.<T>}
   */
  fetchChunkOfSongs ({app, query, playlist}) {
    const slots = query.getSlots(app);
    debug('we have slots:', slots);

    const feederConfig = this.getConfigForOrder(app, query);
    if (!feederConfig) {
      warning(`something wrong we don't have config of feeder`);
    }

    debug('config of feeder', feederConfig);

    const cursor = this.getCursor(app, playlist);
    let totalNumOfAlbums = 0;

    const orderStrategy = orderStrategies.getByName(
      query.getSlot(app, 'order')
    );

    return albumsProvider
      .fetchAlbumsByQuery(
        Object.assign(
          {},
          slots,
          orderStrategy.getPage({app, cursor, feederConfig})
        )
      )
      .then((albums) => {
        if (albums === null) {
          warning(`we received none albums`);
          return;
        }
        debug(`get ${albums.items.length} albums`);
        debug(`in total we have ${albums.total} albums`);
        totalNumOfAlbums = albums.total;
        // TODO: but actually we should get random album (of few of them)
        // and then get few random songs from those albums
        return Promise.all(
          albums.items
            .map(
              album => albumsProvider
                .fetchAlbumDetails(album.identifier, {
                  retry: 3,
                  delay: 100,
                })
                .catch(error => {
                  warning(`we failed on fetching details about album:`, error);
                  return null;
                })
            )
        );
      })
      .then(albums => {
        // drop failed albums
        albums = albums.filter(album => album);

        if (!albums || albums.length === 0) {
          debug('we got none albums');
          return {songs: [], songsInFirstAlbum: 0, totalNumOfAlbums: 0};
        }

        const songsInFirstAlbum = albums[0].songs.length;

        let songs = albums
          .map(this.processAlbumSongs)
          .reduce((allSongs, albumSongs) => {
            return allSongs.concat(albumSongs);
          }, []);

        if (songs.length === 0) {
          warning(`we received zero songs. It doesn't sound ok`);
          // let's try again
          return this.fetchChunkOfSongs({app, query, playlist});
        }

        debug(`we get ${songs.length} songs`);

        songs = orderStrategy.songsPostProcessing({songs, cursor});

        // get chunk of songs
        if (feederConfig.chunk.songs) {
          songs = songs.slice(0, feederConfig.chunk.songs);
          debug(`but only ${songs.length} in chunk left`);
        }

        return {songs, songsInFirstAlbum, totalNumOfAlbums};
      })
      .catch(err => {
        error(`We got an error: ${JSON.stringify(err)}`);
        return Promise.reject(err);
      });
  }

  /**
   * Get configuration based on arguments
   *
   * @private
   * @param app
   * @param query
   * @returns {*}
   */
  getConfigForOrder (app, query) {
    const order = query.getSlot(app, 'order');
    const available = config.feeders[feederName];
    return available[order] || available.defaults;
  }

  /**
   * Get cursor of playlist in sources
   *
   * @private
   * @param app
   * @param playlist
   * @returns {current: {album: number, song: number}, total: {albums: number, songs: number}}
   */
  getCursor (app, playlist) {
    return _.at(playlist.getExtra(app), 'cursor')[0] || defaultCursor;
  }

  /**
   * Do we have next item?
   *
   * @param app
   * @param slots
   * @param playlist
   * @returns {boolean}
   */
  hasNext ({app, query, playlist}) {
    const orderStrategy = orderStrategies.getByName(
      query.getSlot(app, 'order')
    );
    return orderStrategy.hasNext({app, query, playlist});
  }

  /**
   * Move to the next song
   *
   * @param app
   * @param query
   * @param playlist
   *
   * @returns {Promise.<T>}
   */
  next ({app, query, playlist}) {
    debug('move to the next song');
    const orderStrategy = orderStrategies.getByName(
      query.getSlot(app, 'order')
    );

    orderStrategy.moveSourceCursorToTheNextPosition({app, query, playlist});

    // check whether we need to fetch new chunk
    if (playlist.hasNextSong(app, query, playlist)) {
      debug('we have next song so just move cursor without fetching new data');
      playlist.next(app);
      return Promise.resolve();
    } else {
      debug(`we don't have next song in playlist so we'll fetch new chunk of songs`);
      return this.fetchChunkOfSongs({app, query, playlist})
        .then(({songs, songsInFirstAlbum}) => {
          // we'll append new chunk of songs
          let items = playlist.getItems(app).concat(songs);

          // but we shouldn't exceed available size of chunk
          const feederConfig = this.getConfigForOrder(app, query);
          if (items.length > feederConfig.chunk.songs) {
            const shift = items.length - feederConfig.chunk.songs;
            debug(`drop ${shift} old song(s)`);
            items = items.slice(shift);
            playlist.shift(app, -shift);
          }
          playlist.updateItems(app, items);

          orderStrategy.updateCursorTotal({
            app,
            playlist,
            songsInFirstAlbum,
          });

          playlist.next(app);
        });
    }
  }
}

module.exports = new AsyncAlbums();
