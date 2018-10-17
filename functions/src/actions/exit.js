const dialog = require('../dialog');
const query = require('../state/query');
const strings = require('../strings').intents.exit;
const selectors = require('../configurator/selectors');

function handler (app) {
  dialog.close(app, selectors.find(strings, query.getSlots(app)));
}

module.exports = {
  handler,
};
