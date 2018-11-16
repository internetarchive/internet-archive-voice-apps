const strings = require('../strings');
const query = require('../state/query');

const helpers = require('./_helpers');

function handler (app) {
  query.setSlot(app, 'order', 'natural');
  helpers.simpleResponseAndResume(app, strings.intents.shuffleOff);
}

module.exports = {
  handler,
};
