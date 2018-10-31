const dialog = require('../dialog');
const query = require('../state/query');
const strings = require('../strings').intents.help;
const selectors = require('../configurator/selectors');

function handler (app) {
  dialog.ask(app, selectors.find(strings.default, query.getSlots(app)));
}

module.exports = {
  handler,
};
