const strings = require('../strings');
const playlist = require('../state/playlist');

const helpers = require('./_helpers');
const playbackPrevious = require('./playback/previous');

function handler (app) {
  if (playlist.getCurrentSong(app)) {
    return playbackPrevious.handler(app);
  }

  return helpers.simpleResponseAndResume(app, strings.intents.previous.default);
}

module.exports = {
  handler,
};
