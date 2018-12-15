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
const { PlaylistStateError } = require('../../state/playlist');
const { debug, warning, error } = require('../../utils/logger')('ia:feeder:albums-async');
const stripFileName = require('../../utils/strip-filename');

const { orders, DEFAULT_ORDER } = require('../orders');

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

class AlbumsAsyncError extends Error {

}

/**
 * Unique ID of song
 * Specific to IA metadata
 *
 * @type {string}
 */
const SONG_UID = 'audioURL';

/**
 * name of feeder
 */
const feederName = stripFileName(__filename);

class AsyncAlbums extends DefaultFeeder {
  /**
   * Prefetch some songs from albums
   * and create playlist
   *
   * @param app
   * @param query
   * @param playlist
   * @returns {Promise}
   */
  build (ctx) {
    debug('# build async songs feeder');
    const { app, query, playlist } = ctx;

    const currentCursor = this.getCursorCurrent(ctx);
    return this.fetchChunkOfSongs({ app, currentCursor, query, playlist })
      .then(({ songs, songsInFirstAlbum, totalNumOfAlbums }) => {
        // the only place where we modify state
        // so maybe we can put it out of this function?
        debug(`let's create playlist for songs`);
        const cursor = this.getCursor(app, playlist);
        songs = this.processNewSongsBeforeMoveToNext({ app, query, playlist }, cursor, songs);
        playlist.create(app, songs, {
          cursor: Object.assign({}, defaultCursor, {
            total: {
              songs: songsInFirstAlbum,
              albums: totalNumOfAlbums,
            },
          }),
        });
        return { total: totalNumOfAlbums };
      });
  }

  /**
   * Fetch chunk of songs
   *
   * @private
   * @param app
   * @param currentCursor
   * @param query
   * @param playlist
   * @returns {Promise.<T>}
   */
  fetchChunkOfSongs ({ app, currentCursor, query, playlist }) {
    const slots = query.getSlots(app);
    debug('# fetchChunkOfSongs');
    debug('we have slots:', slots);
    debug('currentCursor', currentCursor);

    const feederConfig = this.getConfigForOrder(app, query);
    if (!feederConfig) {
      warning(`something wrong we don't have config of feeder`);
    }

    debug('config of feeder', feederConfig);

    // const cursor = this.getCursor(app, playlist);
    let totalNumOfAlbums = 0;

    const orderStrategy = orders.getByName(
      query.getSlot(app, 'order') || DEFAULT_ORDER
    );

    return albumsProvider
      .fetchAlbumsByQuery(
        app,
        Object.assign(
          {},
          slots,
          orderStrategy.getPage({ currentCursor, feederConfig })
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
                .fetchAlbumDetails(app, album.identifier, {
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
          return {
            songs: [],
            songsInFirstAlbum: 0,
            songsNumInLastAlbum: 0,
            totalNumOfAlbums: 0,
          };
        }

        const songsInFirstAlbum = albums[0].songs.length;
        const numOfSongsInLastAlbum = albums[albums.length - 1].songs.length;

        let songs = albums
          .map(this.processAlbumSongs)
          .reduce((allSongs, albumSongs) => {
            return allSongs.concat(albumSongs);
          }, []);

        let current = currentCursor;
        let cursor = this.getCursor(app, playlist);

        songs = songs.map(s => {
          current = orderStrategy.getNextCursorPosition({
            app,
            cursor,
            playlist,
            current: current,
          });

          return {
            ...s,
            cursor: current,
          };
        });

        if (songs.length === 0) {
          warning(`we received zero songs. It doesn't sound ok`);
          // let's try again
          return this.fetchChunkOfSongs({ app, currentCursor, query, playlist });
        }

        return {
          songs,
          songsInFirstAlbum,
          numOfSongsInLastAlbum,
          totalNumOfAlbums
        };
      })
      .catch(err => {
        error('We got an error:', err);
        return Promise.reject(err);
      });
  }

  /**
   * Process list of songs before move to the next song
   *
   * @param app
   * @param query
   * @param playlist
   * @param songs
   * @returns {*[]}
   */
  processNewSongsBeforeMoveToNext ({ app, query, playlist }, cursorCurrent, songs) {
    debug('# process songs on moving to next');
    const feederConfig = this.getConfigForOrder(app, query);
    const orderStrategy = orders.getByName(
      query.getSlot(app, 'order') || DEFAULT_ORDER
    );

    debug(`we get ${songs.length} songs`);
    songs = orderStrategy.songsPostProcessing({ songs });

    // to chap few songs at the start because we've already fetched them
    // start from song we need
    debug(`cursor.current.song = ${cursorCurrent.song}`);
    if (cursorCurrent.song > 0) {
      debug(`chap ${cursorCurrent.song} songs at the start`);
      songs = songs.slice(cursorCurrent.song);
    }

    // get chunk of songs
    if (feederConfig.chunk.songs && songs.length > feederConfig.chunk.songs) {
      songs = songs.slice(0, feederConfig.chunk.songs);
      debug(`but only ${songs.length} in chunk left`);
    }

    debug('songs:', songs);

    return songs;
  }

  /**
   * Process list of songs before move to the previous song
   *
   * @param songs
   * @param app
   * @param query
   * @param playlist
   * @returns {*[]}
   */
  processNewSongsBeforeMoveToPrevious ({ app, query, playlist }, songs) {
    debug('# process songs on moving to previous');
    const cursor = this.getCursor(app, playlist);
    const feederConfig = this.getConfigForOrder(app, query);
    const orderStrategy = orders.getByName(
      query.getSlot(app, 'order') || DEFAULT_ORDER
    );

    debug(`we get ${songs.length} songs`);

    songs = orderStrategy.songsPostProcessing({ songs, cursor });

    // to chap few songs at the end because we've already fetched them
    // start from song we need
    songs = songs.slice(0, cursor.current.song + 1);

    debug(`left ${songs.length} songs after dropping songs from ${cursor.current.song}`);

    // get chunk of songs
    if (feederConfig.chunk.songs) {
      songs = _.takeRight(songs, feederConfig.chunk.songs);
      // songs = songs.slice(0, feederConfig.chunk.songs);`
      debug(`but only ${songs.length} in chunk left`);
    }

    return songs;
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

  getCursorCurrent ({ app, playlist }) {
    return this.getCursor(app, playlist).current;
  }

  /**
   * we overwrite default because don't need to do extra shuffling
   *
   * @param app
   * @param playlist
   * @returns {*}
   */
  getNextItem ({ app, playlist }) {
    try {
      return playlist.getNextItem(app);
    } catch (err) {
      // sometimes we can add 0 new songs, because all of them were the same
      // as we had before, so we don't have next song (yet)
      // so it will be ok to repeat the last song, before we can get new one
      if (err instanceof PlaylistStateError) {
        return playlist.getLastItem(app);
      }

      throw err;
    }
  }

  setCursorCurrent (ctx, current) {
    debug('# setCursorCurrent', current);
    const { app, playlist } = ctx;

    // store cursor
    playlist.setExtra(app, {
      cursor: {
        ...playlist.getExtra(app).cursor,
        current,
      },
    });
  }

  /**
   * Do we have next item?
   *
   * @param app
   * @param slots
   * @param playlist
   * @returns {boolean}
   */
  hasNext ({ app, query, playlist }) {
    if (playlist.isLoop(app)) {
      return true;
    }

    // always have something when songs in shuffle
    if (query.getSlot(app, 'order') === 'random') {
      return true;
    }

    const orderStrategy = orders.getByName(
      query.getSlot(app, 'order') || DEFAULT_ORDER
    );

    return orderStrategy.hasNext({ app, query, playlist });
  }

  /**
   * TODO: first and last
   */

  /**
   * Do we have next item?
   *
   * @param app
   * @param slots
   * @param playlist
   * @returns {boolean}
   */
  hasPrevious ({ app, query, playlist }) {
    if (playlist.isLoop(app)) {
      return true;
    }

    // always have something when songs in shuffle
    if (query.getSlot(app, 'order') === 'random') {
      return true;
    }

    const orderStrategy = orders.getByName(
      query.getSlot(app, 'order') || DEFAULT_ORDER
    );

    return orderStrategy.hasPrevious({ app, query, playlist });
  }

  /**
   * Move to the next song
   *
   * @param ctx
   * @param {boolean} move
   *
   * @returns {Promise.<T>}
   */
  next (ctx, move = true) {
    debug('# next');
    const { app, query, playlist } = ctx;
    debug('get next song. move:', move);
    const orderStrategy = orders.getByName(
      query.getSlot(app, 'order') || DEFAULT_ORDER
    );

    const cursor = this.getCursor(app, playlist);
    const current = this.getCursorCurrent(ctx);
    const newCurrentCursor = orderStrategy.getNextCursorPosition({ app, current, cursor, playlist });
    if (move) {
      this.setCursorCurrent(ctx, newCurrentCursor);
    }

    return Promise.resolve()
      .then(() => {
        // check whether we need to fetch new chunk
        if (playlist.hasNextSong(app)) {
          debug('we have next song so just move cursor without fetching new data');
          if (move) {
            playlist.next(app);
          }
          return ctx;
        } else {
          debug(`we don't have next song in playlist so we'll fetch new chunk of songs`);
          return this
            .fetchChunkOfSongs({ app, currentCursor: newCurrentCursor, query, playlist })
            .then(({ songs, songsInFirstAlbum }) => {
              songs = this.processNewSongsBeforeMoveToNext({ app, query, playlist }, newCurrentCursor, songs);

              if (songs.length === 0) {
                throw new AlbumsAsyncError('trying to append empty songs list');
              }

              const feederConfig = this.getConfigForOrder(app, query);
              let items = playlist.getItems(app);

              // drop all duplicates
              songs = songs.filter(song => items.every(i => i[SONG_UID] !== song[SONG_UID]));
              if (playlist.getItems(app).length > 0 && !move && songs.length >= feederConfig.chunk.songs) {
                // when we don't move we need to store one extra item
                // and list of appended items more or equal to maximum size of chunk
                // we should drop one song to preserve space for ths current song
                debug('drop one song from appended to preserve space for the current song');
                songs = songs.slice(0, songs.length - 1);
              }

              if (songs.length === 0) {
                warning(`we are going to merge ${songs.length} songs!`);
              } else {
                debug(`we are going to merge ${songs.length} songs`);
              }

              // merge new songs
              items = items.concat(songs);
              debug(`got ${items.length} songs after merge`, items);

              // but we shouldn't exceed available size of chunk
              if (items.length > feederConfig.chunk.songs) {
                debug('we exceed available space and should drop few songs');
                let shift = items.length - feederConfig.chunk.songs;
                debug(`drop ${shift} old song(s)`);
                items = items.slice(shift);
                // we don't need to slide in case of move
                // because later we will jump to the 1st fetched song
                if (!move) {
                  debug(`slide current position on ${-shift}`);
                  playlist.shift(app, -shift);
                }
              }

              debug('update playlist with new items', items);
              playlist.updateItems(app, items);

              if (move) {
                // we have attached new songs and would like to jump to the 1st song
                const firstAddedSong = items.find(i => songs.find(song => i[SONG_UID] === song[SONG_UID]));
                debug(`we would find 1st songs of added songs is "${firstAddedSong}", and move there`);
                if (firstAddedSong) {
                  playlist.moveTo(app, firstAddedSong);
                } else {
                  warning('it seems that we have not add any songs and we can not find any of them in a items list');
                  if (playlist.isLoop(app)) {
                    debug('It could be ok for small loop');
                    playlist.next(app);
                  }
                }
              }

              // as well move source cursor
              orderStrategy.updateCursorTotal({
                app,
                playlist,
                songsInFirstAlbum,
              });

              return ctx;
            });
        }
      });
  }

  /**
   * Move to the previous song
   *
   * @param ctx
   *
   * @returns {Promise.<T>}
   */
  previous (ctx) {
    debug('# move to the previous song');
    const { app, query, playlist } = ctx;
    const orderStrategy = orders.getByName(
      query.getSlot(app, 'order') || DEFAULT_ORDER
    );

    const current = this.getCursorCurrent(ctx);
    const newCurrentCursor = orderStrategy.getPreviousCursorPosition({ app, current, playlist });
    this.setCursorCurrent(ctx, newCurrentCursor);

    return Promise.resolve()
      .then(() => {
        // check whether we need to fetch new chunk
        if (playlist.hasPreviousSong(app)) {
          debug('we have previous song so just move cursor without fetching new data');
          playlist.previous(app);
          return ctx;
        } else {
          debug(`we don't have previous song in playlist so we'll fetch new chunk of songs`);
          return this
            .fetchChunkOfSongs({ app, currentCursor: newCurrentCursor, query, playlist })
            .then(({ songs, numOfSongsInLastAlbum }) => {
              orderStrategy.clampCursorSongPosition({ app, playlist }, numOfSongsInLastAlbum - 1);

              songs = this.processNewSongsBeforeMoveToPrevious({ app, query, playlist }, songs);

              // but we shouldn't exceed available size of chunk
              const feederConfig = this.getConfigForOrder(app, query);

              // get last tail of songs
              songs = _.takeRight(songs, feederConfig.chunk.songs);

              // merge new songs
              let items = songs.concat(playlist.getItems(app));

              if (items.length > feederConfig.chunk.songs) {
                debug(`drop ${items.length - feederConfig.chunk.songs} old song(s)`);
                items = items.slice(0, feederConfig.chunk.songs);
              }
              // because we append new songs at the playlist start
              // we should shift its current position to the size of appended songs
              playlist.shift(app, songs.length - 1);
              playlist.updateItems(app, items);

              orderStrategy.updateCursorTotal({
                app,
                playlist,
                numOfSongsInLastAlbum,
              });

              return ctx;
            });
        }
      });
  }
}

module.exports = new AsyncAlbums();
