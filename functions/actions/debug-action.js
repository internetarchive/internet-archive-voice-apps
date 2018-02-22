const debug = require('debug')('ai:actions:debug-action:debug');

const dialog = require('../dialog');
const playlist = require('../state/playlist');
const search = require('../search/audio');

/**
 * it is special handler for debug-action
 * which could be mapped for any sequence of words id DialogFlow
 * For example 'debug playlist'
 *
 * @param app
 */
function handler (app) {
  debug(`Start debug action handler`);

  // TODO: should fetch only few songs from album
  const albumId = 'gd73-06-10.sbd.hollister.174.sbeok.shnf';
  search.getAlbumById(albumId)
    .then(album => {
      debug(`We get album ${JSON.stringify(album)}`);
      const songs = album.songs
        .map((song, idx) => Object.assign({}, song, {
          audioURL: `https://archive.org/download/${albumId}/${song.filename}`,
          coverage: album.coverage,
          imageURL: `https://archive.org/services/img/${albumId}`,
          suggestions: ['TODO'],
          track: idx + 1,
          year: album.year,
        }));

      playlist.create(app, songs);

      dialog.playSong(app, playlist.getCurrentSong(app));
    })
    .catch(err => {
      dialog.ask(`We got an error: ${JSON.stringify(err)}.
                  Do you want to try again?`);
    });
}

module.exports = {
  handler,
};
