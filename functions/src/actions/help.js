const dialog = require('../dialog');
const selectors = require('../configurator/selectors');
const { getLastPhrase } = require('../state/dialog');
const { getSlots } = require('../state/query');
const strings = require('../strings').intents.help;

const helpers = require('./_helpers');

function handler (app) {
  const ctx = Object.assign({}, {
    last: getLastPhrase(app),
    slots: getSlots(app),
  });

  dialog.ask(app, helpers.substitute(selectors.find(strings.default, ctx), ctx));
}

module.exports = {
  handler,
};
