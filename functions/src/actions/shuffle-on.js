const strings = require('../strings');
const query = require('../state/query');

const helpers = require('./_helpers');

function handler (app) {
  query.setSlot(app, 'order', 'random');
  return helpers.simpleResponseAndResume(app, strings.intents.shuffleOn);
}

module.exports = {
  handler,
};
