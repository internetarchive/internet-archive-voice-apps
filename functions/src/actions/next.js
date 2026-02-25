const strings = require('../strings');
const playlist = require('../state/playlist');

const helpers = require('./_helpers');
const playbackNext = require('./playback/next');

function handler (app) {
  if (playlist.getCurrentSong(app)) {
    return playbackNext.handler(app);
  }

  return helpers.simpleResponseAndResume(app, strings.intents.next.default);
}

module.exports = {
  handler,
};
