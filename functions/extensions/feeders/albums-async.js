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
 * TODO:
 * right now it just download big chunk of songs and
 * simulates async behaviour.
 *
 * btw it isn't covered by tests because right now we have
 * simplified implementation
 */

const debug = require('debug')('ia:feeder:albums:debug');
const warning = require('debug')('ia:feeder:albums:warning');

const albumsProvider = require('../../provider/albums');

const DefaultFeeder = require('./_default');

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
    debug('lets build random songs feeder');

    const slots = query.getSlots(app);
    debug('we have slots:', slots);

    return albumsProvider
      .fetchAlbumsByQuery(Object.assign({}, slots, {
        // it is not really slot
        // because right now it is just simulation of
        // very large async albums playlist

        // IA has limit - maximum 10 requests
        limit: 10,
      }))
      .then((albums) => {
        if (albums === null) {
          warning(`we received none albums`);
          return;
        }
        debug(`get ${albums.items.length} albums`);
        // right now we fetch details of all albums
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

        const songs = albums
          .map(this.processAlbumSongs)
          .reduce((allSongs, albumSongs) => {
            return allSongs.concat(albumSongs);
          }, []);

        debug(`We get ${songs.length} songs`);

        // the only place where we modify state
        // so maybe we can put it out of this function?
        debug(`let's create playlist for songs`);
        playlist.create(app, songs);
      });
    // TODO:
    // .catch(err => {
    // dialog.ask(app, {
    //   speech: `We got an error: ${JSON.stringify(err)}. Do you want to try again?`
    // });
    // });
  }
}

module.exports = new AsyncAlbums();
