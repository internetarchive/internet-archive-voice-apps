/**
 * Synchronous Albums feeder
 * it fetches all data at once and holds it in state of user
 *
 * pros:
 * - it knows exactly its total size
 * - doesn't have delay on swapping between songs
 *
 * cons:
 * - could have delay on building
 * - could be exhaustive for user's state
 *   (because we need to hold all fetched songs).
 * - not efficient for big playlist and doesn't work for unlimited one
 */

const { debug, warning } = require('../../utils/logger')('ia:feeder:albums');
const objToLowerCase = require('../../utils/map-to-lowercases');
const albumsProvider = require('../../provider/albums');

const DefaultFeeder = require('./_default');

class SyncAlbum extends DefaultFeeder {
  /**
   * Prefetch some songs from albums
   * and update playlist
   *
   * @param app
   * @param query
   * @param playlist
   * @returns {Promise}
   */
  build ({ app, query, playlist }) {
    debug('lets build albums feeder');
    // make all values low cases string
    const slots = objToLowerCase(query.getSlots(app));
    debug('we have slots:', slots);
    let total;
    return albumsProvider
      .fetchAlbumsByQuery(app, slots)
      .then(albums => {
        if (albums === null) {
          warning('we received none albums');
          return;
        }
        debug(`get ${albums.items.length} albums`);
        debug(albums.items);
        let albumId = null;
        total = albums.total || albums.items.length;
        switch (albums.items.length) {
          case 0:
            // TODO: there is no such album
            // - suggest other albums
            debug('there is no albums');
            break;
          case 1:
            albumId = albums.items[0].identifier;
            break;
          default:
            // TODO: we get more than 1 album
            // maybe we should ask user to clarify which album
            // to play.

            // TODO: of if we pretty sure they are very close like:
            // - https://archive.org/details/gd73-06-09.sbd.hollister.172.sbeok.shnf
            // - https://archive.org/details/gd73-06-10.sbd.hollister.174.sbeok.shnf
            // we should play they are together.
            // const names = albums.items
            //   .slice(0, 10)
            //   .map(album => `${album.coverage} ${album.year}`)
            //   .join(', ');

            // dialog.ask(app, {
            //   speech: `DEBUG: we get ${albums.items.length} albums: ${names}`,
            // });

            // TODO: for the moment just play 1st album
            // but we should make playlist from all albums
            albumId = albums.items[0].identifier;
            break;
        }
        return albumId;
      })
      .then((albumId) => {
        if (albumId) {
          debug('id of album:', albumId);
          return albumsProvider.fetchAlbumDetails(app, albumId);
        }
      })
      .then(album => {
        if (!album) {
          debug('we get none album');
          // TODO: we don't get album
          return null;
        }

        debug('We get album', album);

        const songs = this.processAlbumSongs(app, album);

        debug(`We get ${songs.length} songs`);
        // the only place where we modify state
        // so maybe we can put it out of this function?
        debug('let\'s create playlist for songs');
        playlist.create(app, songs);

        // Store total and slots in playlist extra for fetching random albums later
        playlist.setExtra(app, { total, slots });

        return { total };
      });
    // TODO:
    // .catch(err => {
    // dialog.ask(app, {
    //   speech: `We got an error: ${JSON.stringify(err)}. Do you want to try again?`
    // });
    // });
  }

  /**
   * Move to the next song
   * Called by both "next" and "skip" commands
   * If playlist runs out and order is random, try to fetch a random album
   *
   * @param ctx
   * @param move
   * @returns {Promise.<T>}
   */
  next (ctx, move = true) {
    const { app, playlist } = ctx;

    // Check if there are more songs in the current playlist
    if (playlist.hasNextSong(app)) {
      // Just move to the next song
      if (move) {
        debug('move to the next song');
        playlist.next(app);
      }
      return Promise.resolve(ctx);
    }

    // No more songs in playlist, try to fetch a random album from the collection
    debug('playlist ran out, attempting to fetch random album');
    const extra = playlist.getExtra(app);
    let slots = extra && extra.slots;
    const total = extra && extra.total;

    // Fallback: try to get slots from query if extra data is missing
    if (!slots && ctx.query) {
      try {
        slots = objToLowerCase(ctx.query.getSlots(app));
        debug('got slots from query as fallback:', slots);
      } catch (e) {
        warning('error getting slots from query:', e);
      }
    }

    if (!slots) {
      warning('no slots found, cannot fetch random album');
      return Promise.reject(new Error('No slots available to fetch more albums'));
    }

    return this.fetchRandomAlbum(ctx, slots, total, move)
      .then(result => {
        // Verify that we actually have a next song after the fetch
        if (!playlist.hasNextSong(app) && !playlist.getCurrentSong(app)) {
          return Promise.reject(new Error('Could not fetch more songs'));
        }
        return result;
      });
  }

  /**
   * Fetch a random album and add it to the playlist
   *
   * @private
   * @param ctx
   * @param slots
   * @param total
   * @param move
   * @returns {Promise}
   */
  fetchRandomAlbum (ctx, slots, total, move = true) {
    const { app, playlist } = ctx;

    // Calculate random page number
    const limit = 3;
    const maxPage = total ? Math.max(0, Math.floor((total - 1) / limit)) : 100;
    const randomPage = Math.floor(Math.random() * (maxPage + 1));

    debug(`fetching random album from page ${randomPage} (total: ${total || 'unknown'}, maxPage: ${maxPage})`);

    return albumsProvider
      .fetchAlbumsByQuery(app, {
        ...slots,
        limit: limit,
        page: randomPage,
        order: 'best',
      })
      .then(albums => {
        if (!albums || !albums.items || albums.items.length === 0) {
          warning('no albums found for random fetch');
          return Promise.reject(new Error('No albums found'));
        }

        // Pick a random album from the results
        const randomAlbum = albums.items[Math.floor(Math.random() * albums.items.length)];
        debug(`selected random album: ${randomAlbum.identifier} from ${albums.items.length} albums`);

        return albumsProvider.fetchAlbumDetails(app, randomAlbum.identifier);
      })
      .then(album => {
        if (!album) {
          warning('failed to fetch random album details');
          return Promise.reject(new Error('Failed to fetch album details'));
        }

        debug('fetched random album', album);
        const songs = this.processAlbumSongs(app, album);
        debug(`adding ${songs.length} songs from random album to playlist`);

        // Preserve extra data
        const currentExtra = playlist.getExtra(app);
        const extraToPreserve = currentExtra || { total, slots };

        // Append new songs to existing playlist
        const currentItems = playlist.getItems(app);
        const newItems = currentItems.concat(songs);
        playlist.updateItems(app, newItems);

        // Restore extra data if it was lost
        if (extraToPreserve) {
          playlist.setExtra(app, extraToPreserve);
        }

        // Move to the first new song
        if (move && songs.length > 0) {
          playlist.moveTo(app, songs[0]);
        }

        // Restore extra data after moveTo if lost
        const extraAfterMove = playlist.getExtra(app);
        if (!extraAfterMove && extraToPreserve) {
          playlist.setExtra(app, extraToPreserve);
        }

        return ctx;
      });
  }
}

module.exports = new SyncAlbum();
