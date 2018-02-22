const dialog = require('../dialog');

/**
 * it is special handler for debug-action
 * which could be mapped for any sequence of words id DialogFlow
 * For example 'debug playlist'
 *
 * @param app
 */
function handler(app) {
  dialog.song(app, {
    audioURL: 'https://archive.org/download/gd73-06-10.sbd.hollister.174.sbeok.shnf/gd73-06-10d1t01.mp3',
    coverage: 'Washington, DC',
    imageURL: 'https://archive.org/services/img/gd73-06-10.sbd.hollister.174.sbeok.shnf',
    suggestions: ['rewind', 'next'],
    title: 'Morning Dew',
    track: 1,
    year: 197,
  });
}

module.exports = {
  handler,
};
