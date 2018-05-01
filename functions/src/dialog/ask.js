const {savePhrase} = require('../state/dialog');
const {debug} = require('../utils/logger')('ia:dialog:ask');
const escapeHTML = require('../utils/escape-html');

/**
 * ask user with suggestions
 *
 * @param app
 * @param speech {string} assistant will speak it
 * @param reprompt {string}
 * @param suggestions {array}
 */
module.exports = function (app, {speech, reprompt = null, suggestions = null}) {
  debug('ask', speech, reprompt, suggestions);

  if (typeof app === 'string') {
    throw new Error(`Argument 'app' should be DialogflowApp object but we get ${app}`);
  }

  if (!speech) {
    throw new Error(`Argument 'speech' is not defined: ${speech}`);
  }

  savePhrase(app, {
    speech,
    reprompt,
    suggestions,
  });

  if (Array.isArray(suggestions)) {
    suggestions = suggestions.map(s => s.toString());
  }

  if (Array.isArray(speech)) {
    speech = speech.map(s => escapeHTML(s));
  } else {
    speech = escapeHTML(speech);
  }

  app.response({speech, reprompt, suggestions});
};
