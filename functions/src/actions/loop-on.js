const strings = require('../strings');
const helpers = require('./_helpers');

function handler (app) {
  helpers.simpleResponse(app, strings.intents.loopOn.default);
}

module.exports = {
  handler,
};
