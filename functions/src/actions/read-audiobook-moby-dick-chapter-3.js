const dialog = require('../dialog');

/**
 * Handle experimental intent:
 *
 * Read Moby Dick Chapter Three
 *
 * @param app
 */
function handler (app) {
  return dialog.playSong(app, Object.assign(
    {}, {
      // needed for Alexa
      // mediaResponseOnly: false,
      // offset,
      title: 'Moby Dick Chapter Three',
      creator: 'Herman Melville',
      imageURL: 'https://archive.org/download/moby_dick_librivox/Moby_Dick_1002.jpg',
      collections: ['librivox'],
      audioURL: 'http://archive.org/download/moby_dick_librivox/mobydick_003_melville.mp3',
      speech: 'Moby Dick Chapter Three.',
      description: 'Moby Dick Chapter Three',
    }
  ));
}

module.exports = {
  handler,
};
