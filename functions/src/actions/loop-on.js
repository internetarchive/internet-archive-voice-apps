const strings = require('../strings');
const playlist = require('../state/playlist');

const helpers = require('./_helpers');

function handler (app) {
  playlist.setLoop(app, true);
  helpers.simpleResponse(app, strings.intents.loopOn.default);
}

module.exports = {
  handler,
};
