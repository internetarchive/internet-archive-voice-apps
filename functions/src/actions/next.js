const strings = require('../strings');

const helpers = require('./_helpers');

function handler (app) {
  return helpers.simpleResponseAndResume(app, strings.intents.next.default);
}

module.exports = {
  handler,
};
