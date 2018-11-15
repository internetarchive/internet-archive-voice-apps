const playlist = require('../../state/playlist');
const strings = require('../../strings');

const defaultHelpers = require('../_helpers');
const playbackHelpers = require('./_helpers');

function handler (app) {
  playlist.setLoop(app, false);
  defaultHelpers.simpleResponse(app, strings.intents.loopOff.playback);
  return playbackHelpers.resume({ app });
}

module.exports = {
  handler,
};
