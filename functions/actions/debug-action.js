const dialog = require('../dialog');
const playlist = require('../state/playlist');

/**
 * it is special handler for debug-action
 * which could be mapped for any sequence of words id DialogFlow
 * For example 'debug playlist'
 *
 * @param app
 */
function handler(app) {
  playlist.create(app, [{
    audioURL: 'https://archive.org/download/gd73-06-10.sbd.hollister.174.sbeok.shnf/gd73-06-10d1t01.mp3',
    coverage: 'Washington, DC',
    imageURL: 'https://archive.org/services/img/gd73-06-10.sbd.hollister.174.sbeok.shnf',
    suggestions: ['rewind', 'next'],
    title: 'Morning Dew',
    track: 1,
    year: 1973,
  }, {
    audioURL: 'https://archive.org/download/gd73-06-10.sbd.hollister.174.sbeok.shnf/gd73-06-10d1t02.mp3',
    coverage: 'Washington, DC',
    imageURL: 'https://archive.org/services/img/gd73-06-10.sbd.hollister.174.sbeok.shnf',
    suggestions: ['rewind', 'next'],
    title: 'Beat It On Down The Line',
    track: 1,
    year: 1973,
  }]);

  dialog.song(app, playlist.getCurrentSong(app));
}

module.exports = {
  handler,
};
