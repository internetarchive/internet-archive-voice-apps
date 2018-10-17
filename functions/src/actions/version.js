const mustache = require('mustache');

const dialog = require('../dialog');
const packageJSON = require('../../package.json');
const versionStrings = require('../strings').intents.version;
const { getLastReprompt, getLastSuggestions } = require('../state/dialog');

/**
 * handle version intent
 *
 * @param app
 */
function handler (app) {
  let reprompt = getLastReprompt(app);
  let speech = mustache.render(versionStrings.speech, packageJSON);
  let suggestions = getLastSuggestions(app);

  dialog.ask(app, { speech, reprompt, suggestions });
}

module.exports = {
  handler,
};
