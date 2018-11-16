const strings = require('../strings');

const helpers = require('./_helpers');

function handler (app) {
  return helpers.simpleResponseAndResume(app, strings.intents.previous.default);
}

module.exports = {
  handler,
};
