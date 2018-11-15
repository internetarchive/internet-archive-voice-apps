const strings = require('../strings');
const playlist = require('../state/playlist');

const helpers = require('./_helpers');

function handler (app) {
  playlist.setLoop(app, false);
  helpers.simpleResponse(app, strings.intents.loopOff.default);
}

module.exports = {
  handler,
};
