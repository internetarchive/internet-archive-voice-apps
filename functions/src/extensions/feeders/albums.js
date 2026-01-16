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
        return { albumId, total, slots };
      })
      .then(({ albumId, total, slots }) => {
        // Store total and slots in playlist extra for fetching random albums later
        playlist.setExtra(app, { total, slots });
        
        if (albumId) {
          debug('id of album:', albumId);
          return albumsProvider.fetchAlbumDetails(app, albumId);
        }
        return null;
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
        const extra = playlist.getExtra(app);
        playlist.create(app, songs, extra);

        return { total: extra.total };
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
   * If playlist runs out, fetch a random album from the collection
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

    // No more songs, fetch a random album
    debug('playlist ran out, fetching random album');
    let extra = playlist.getExtra(app);
    let slots = extra && extra.slots;
    let total = extra && extra.total;
    
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
      return Promise.resolve(ctx);
    }
    
    // If we don't have total, try to fetch it first
    if (!total) {
      debug('total not found in extra, fetching to get total count');
      return albumsProvider
        .fetchAlbumsByQuery(app, slots)
        .then(albums => {
          if (albums && albums.total) {
            total = albums.total;
            // Update extra with total for future use
            playlist.setExtra(app, { ...extra, total, slots });
            debug(`got total from API: ${total}`);
          }
          // Continue with random fetch even if we couldn't get total
          return this.fetchRandomAlbum(ctx, slots, total, move);
        })
        .catch(error => {
          warning('error fetching total:', error);
          // Still try to fetch random album with estimated total
          return this.fetchRandomAlbum(ctx, slots, 1000, move); // Use a reasonable default
        });
    }
    
    return this.fetchRandomAlbum(ctx, slots, total, move);
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
    // Each page has limit items, so max page = Math.floor(total / limit)
    const limit = 3; // Fetch multiple albums to pick randomly from
    const maxPage = total ? Math.max(0, Math.floor((total - 1) / limit)) : 100; // Default to page 100 if total unknown
    const randomPage = Math.floor(Math.random() * (maxPage + 1));

    debug(`fetching random album from page ${randomPage} (total: ${total || 'unknown'}, maxPage: ${maxPage})`);

    return albumsProvider
      .fetchAlbumsByQuery(app, {
        ...slots,
        limit: limit, // Fetch multiple albums for better randomness
        page: randomPage,
        order: 'best', // Use best order to get random page
      })
      .then(albums => {
        if (!albums || !albums.items || albums.items.length === 0) {
          warning('no albums found for random fetch');
          return ctx;
        }

        // Pick a random album from the results for better randomness
        const randomAlbum = albums.items[Math.floor(Math.random() * albums.items.length)];
        debug(`selected random album: ${randomAlbum.identifier} from ${albums.items.length} albums`);

        return albumsProvider.fetchAlbumDetails(app, randomAlbum.identifier);
      })
      .then(album => {
        if (!album) {
          warning('failed to fetch random album details');
          return ctx;
        }

        debug('fetched random album', album);
        const songs = this.processAlbumSongs(app, album);
        debug(`adding ${songs.length} songs from random album to playlist`);

        // IMPORTANT: Ensure extra data is set BEFORE updating items
        // This ensures it's preserved even if updateItems has issues
        const currentExtra = playlist.getExtra(app);
        const extraToPreserve = currentExtra || (slots && total ? { total, slots } : null);
        if (extraToPreserve) {
          playlist.setExtra(app, extraToPreserve);
          debug('ensuring extra data is set before updating items:', extraToPreserve);
        }

        // Append new songs to existing playlist
        const currentItems = playlist.getItems(app);
        const newItems = currentItems.concat(songs);
        playlist.updateItems(app, newItems);

        // Double-check extra data is still there after updateItems
        const extraAfterUpdate = playlist.getExtra(app);
        if (!extraAfterUpdate && extraToPreserve) {
          warning('extra data was lost after updateItems, restoring it');
          playlist.setExtra(app, extraToPreserve);
        } else {
          debug('extra data preserved after updateItems:', extraAfterUpdate);
        }

        // Move to the first new song
        if (move && songs.length > 0) {
          playlist.moveTo(app, songs[0]);
        }

        // Final check: ensure extra data is still there after moveTo
        const extraAfterMove = playlist.getExtra(app);
        if (!extraAfterMove && extraToPreserve) {
          warning('extra data was lost after moveTo, restoring it');
          playlist.setExtra(app, extraToPreserve);
        }

        return ctx;
      })
      .catch(error => {
        warning('error fetching random album:', error);
        return ctx;
      });
  }

  /**
   * Do we have next item?
   * Always return true if we can fetch more albums from the collection
   *
   * @param ctx
   * @returns {boolean}
   */
  hasNext (ctx) {
    const { app, query, playlist } = ctx;
    
    // If playlist is looped, always have next
    if (playlist.isLoop(app)) {
      debug('hasNext: playlist is looped');
      return true;
    }

    // If there are more songs in current playlist, we have next
    if (playlist.hasNextSong(app)) {
      debug('hasNext: has more songs in current playlist');
      return true;
    }

    // Always have something when songs in shuffle/random order
    try {
      if (query && typeof query.getSlot === 'function') {
        const order = query.getSlot(app, 'order');
        if (order === 'random') {
          debug('hasNext: order is random');
          return true;
        }
      }
    } catch (e) {
      debug('hasNext: error checking order slot:', e);
    }

    // Check if we can fetch more albums from the collection
    let extra = playlist.getExtra(app);
    debug('hasNext check - extra from playlist:', extra);
    
    // Fallback: try to get slots from query if extra data is missing
    if ((!extra || !extra.slots) && query && typeof query.getSlots === 'function') {
      try {
        const querySlots = query.getSlots(app);
        if (querySlots && Object.keys(querySlots).length > 0) {
          debug('hasNext: got slots from query as fallback:', querySlots);
          // If we have query slots, we can always fetch more albums
          return true;
        }
      } catch (e) {
        debug('hasNext: error getting slots from query:', e);
      }
    }
    
    if (extra && extra.total && typeof extra.total === 'number' && extra.total > 0) {
      // We can always fetch more random albums from the collection
      debug(`hasNext: can fetch more albums (total: ${extra.total})`);
      return true;
    }

    // If we have slots stored, we can try to fetch more (even if total is unknown)
    if (extra && extra.slots && Object.keys(extra.slots).length > 0) {
      debug('hasNext: have slots stored, can try to fetch more albums');
      return true;
    }

    debug('hasNext: no more songs available and cannot fetch more');
    return false;
  }
}

module.exports = new SyncAlbum();
