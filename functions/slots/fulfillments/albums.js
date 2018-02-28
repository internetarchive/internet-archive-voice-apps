const debug = require('debug')('ia:feeder:albums');
const mustache = require('mustache');

const config = require('../../config');
const audio = require('../../provider/audio');
const creatorProvider = require('../../provider/creator');

/**
 * Prefetch some songs from albums
 * and update playlist
 *
 * @param app
 * @param query
 * @param playlist
 * @returns {Promise.<TResult>}
 */
function build (app, query, playlist) {
  const slots = query.getSlots(app);
  return creatorProvider
    .fetchAlbumsByQuery(slots)
    .then(albums => {
      if (albums === null) {
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
      return albumId && audio.fetchAlbumDetails(albumId)
    })
    .then(album => {
      if (!album) {
        // TODO: we don't get album
        return;
      }
      debug(`We get album ${JSON.stringify(album)}`);
      const songs = album.songs
        .map((song, idx) => Object.assign({}, song, {
          audioURL: audio.getSongUrlByAlbumIdAndFileName(album.id, song.filename),
          coverage: album.coverage,
          imageURL: mustache.render(config.media.POSTER_OF_ALBUM, album),
          // TODO : add recommendations
          suggestions: ['TODO'],
          track: idx + 1,
          year: album.year,
        }));

      // the only place where we modify state
      // so maybe we can put it out of this function?
      playlist.create(app, songs);
    });
    // TODO:
    // .catch(err => {
    // dialog.ask(app, {
    //   speech: `We got an error: ${JSON.stringify(err)}. Do you want to try again?`
    // });
    // });
}

/**
 * Do we have any songs here?
 *
 * @param slots
 * @param playlist
 * @returns {boolean}
 */
function isEmpty (app, slots, playlist) {
  return playlist.isEmpty(app);
}

function getCurrentItem (app, slots, playlist) {

}

function hasNextSong () {

}

function next () {
  return Promise.resolve();
}

module.exports = {
  build,
  isEmpty,
  getCurrentItem,
  hasNextSong,
  next,
};
