const dialog = require('../dialog');
const {getLastPhrase} = require('../state/dialog');
const strings = require('../strings').intents.order;
const {debug} = require('../utils/logger')('ia:actions:order');

function handler (app) {
  debug('order in context of default state!');
  dialog.ask(app, dialog.merge(strings, getLastPhrase(app)));
}

module.exports = {
  handler,
};
