const {savePhrase} = require('../state/dialog');
const {debug} = require('../utils/logger')('ia:dialog:ask');

/**
 * ask user with suggestions
 *
 * @param app
 * @param speech {string} assistant will speak it
 * @param reprompt {string}
 * @param suggestions {array}
 */
module.exports = function (app, {speech, reprompt = null, suggestions = null}) {
  debug('ask', speech, suggestions);

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

  if (!suggestions) {
    app.ask(speech);
  } else {
    if (Array.isArray(suggestions)) {
      suggestions = suggestions.map(s => s.toString());
    }

    app.ask(app.buildRichResponse()
      .addSimpleResponse(speech)
      .addSuggestions(suggestions));
  }
};
