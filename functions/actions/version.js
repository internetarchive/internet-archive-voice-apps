const mustache = require('mustache');

const dialog = require('../dialog');
const versionStrings = require('../strings').intents.version;
const {getLastReprompt, getLastSuggestions} = require('../state/dialog');

let versionPackage = require('../package.json');

/**
 * handle version intent
 *
 * @param app
 */
function handler (app) {
  let reprompt = getLastReprompt;
  let speech = mustache.render(versionStrings.speech, {version: versionPackage.version});
  let suggestions = getLastSuggestions;

  dialog.ask(app, {speech, reprompt, suggestions});
}

module.exports = {
  handler,
};
