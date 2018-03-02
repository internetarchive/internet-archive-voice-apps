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
 */

const debug = require('debug')('ia:feeder:albums:debug');
const warning = require('debug')('ia:feeder:albums:warning');
const mustache = require('mustache');

const config = require('../../config');
const albumsProvider = require('../../provider/albums');
const songsProvider = require('../../provider/songs');

const DefaultFeeder = require('./_default');

class AsyncAlbums extends DefaultFeeder {
  /**
   * Prefetch some songs from albums
   * and update playlist
   *
   * @param app
   * @param query
   * @param playlist
   * @returns {Promise.<TResult>}
   */
  build (app, query, playlist) {
    debug('lets build random songs feeder');

    const slots = query.getSlots(app);
    debug('we have slots:', slots);

    // TODO: fetch random albums
    // TODO: get 1st mp3 there
    return albumsProvider
      .fetchAlbumsByQuery(Object.assign({}, slots, {
        // predefined slots
        // it is not really slot because right now it is just
        limit: 50,
        // sort: 'random',
      }))
      .then(albums => {
        if (albums === null) {
          warning(`we received none albums`);
          return;
        }
        debug(`get ${albums.items.length} albums`);
        debug(albums.items);
        let albumId = null;
        switch (albums.items.length) {
          case 0:
            // TODO: there is no such album
            // - suggest other albums
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
        debug('id of album:', albumId);
        return albumId && albumsProvider.fetchAlbumDetails(albumId);
      })
      .then(album => {
        if (!album) {
          debug('we get none album');
          // TODO: we don't get album
          return;
        }
        debug(`We get album ${JSON.stringify(album)}`);
        const songs = album.songs
          // exclude songs without title
          .map((song, idx) => Object.assign({}, song, {
            audioURL: songsProvider.getSongUrlByAlbumIdAndFileName(album.id, song.filename),
            coverage: album.coverage,
            imageURL: mustache.render(config.media.POSTER_OF_ALBUM, album),
            // TODO : add recommendations
            suggestions: ['TODO'],
            track: idx + 1,
            year: album.year,
          }));

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
