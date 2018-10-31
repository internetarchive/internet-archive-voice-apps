const dialog = require('../dialog');
const { getLastPhrase } = require('../state/dialog');
const { getSlots } = require('../state/query');
const strings = require('../strings').intents.help;
const selectors = require('../configurator/selectors');

const helpers = require('./_helpers');

function handler (app) {
  const ctx = Object.assign({}, {
    slots: getSlots(app),
    previous: getLastPhrase(app),
  });
  dialog.ask(app, helpers.substitute(selectors.find(strings.default, ctx), ctx));
}

module.exports = {
  handler,
};
