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

const debug = require('debug')('ia:feeder:albums:debug');
const warning = require('debug')('ia:feeder:albums:warning');
const error = require('debug')('ia:feeder:albums:error');
const _ = require('lodash');

const config = require('../../config');
const albumsProvider = require('../../provider/albums');
const comporators = require('../../utils/sort-comparators');
const stripFileName = require('../../utils/strip-filename');

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
  build (app, query, playlist) {
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

    return albumsProvider
      .fetchAlbumsByQuery(Object.assign({}, slots, {
        // size of chunk
        limit: feederConfig.chunk.albums,
        // request next portion of albums
        page: Math.floor(cursor.current.album / feederConfig.chunk.albums),
      }))
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
          debug('we get none albums');
          // TODO: we don't get album
          return;
        }

        const songsInFirstAlbum = albums[0].songs.length;

        let songs = albums
          .map(this.processAlbumSongs)
          .reduce((allSongs, albumSongs) => {
            return allSongs.concat(albumSongs);
          }, []);

        debug(`we get ${songs.length} songs`);

        // shuffle songs
        const order = query.getSlot(app, 'order');
        if (order) {
          const comporator = comporators.getOne(order);
          songs = songs.sort(comporator);
        }

        // start from songs we need
        songs = songs.slice(cursor.current.song);

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
  hasNext (app, slots, playlist) {
    const cursor = playlist.getExtra(app).cursor;
    // Isn't it the last album
    if (cursor.current.album < cursor.total.albums - 1) {
      return true;
    }
    // Isn't it the last song?
    return cursor.current.song < cursor.total.songs - 1;
  }

  /**
   * Move to the next song
   *
   * @returns {Promise.<T>}
   */
  next (app, query, playlist) {
    debug('move to the next song');

    // move source cursor to the next position
    const cursor = playlist.getExtra(app).cursor;
    const current = Object.assign({}, cursor.current);
    current.song++;
    if (current.song >= cursor.total.songs) {
      debug('move cursor to a next album');
      current.song = 0;
      current.album++;
      if (current.album >= cursor.total.albums) {
        debug('the end of playlist');
        current.album--;
      }
    } else {
      debug('move cursor to a next song');
    }

    // store cursor
    playlist.updateExtra(app, {
      cursor: Object.assign({}, cursor, {current}),
    });

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
          const feederConfig = this.getConfigForOrder(app, query);

          let items = playlist.getItems(app).concat(songs);

          // but we shouldn't exceed available size of chunk
          if (items.length > feederConfig.chunk.songs) {
            const shift = items.length - feederConfig.chunk.songs;
            debug(`drop ${shift} old song(s)`);
            items = items.slice(shift);
            playlist.shift(app, -shift);
          }
          playlist.updateItems(app, items);

          // should update total number of songs
          // actually we could get new number
          // when we switch to the new album
          const cursor = playlist.getExtra(app).cursor;
          const total = Object.assign({}, cursor.total);
          total.songs = songsInFirstAlbum;
          playlist.updateExtra(app, {
            cursor: Object.assign({}, cursor, {total}),
          });

          playlist.next(app);
        });
    }
  }
}

module.exports = new AsyncAlbums();
