const {savePhrase} = require('../state/context');

/**
 * ask user with suggestions
 *
 * @param app
 * @param message
 * @param suggestions
 * @param reprompt
 */
module.exports = function (app, message, suggestions = null, reprompt = null) {
  app.ask(app.buildRichResponse()
    .addSimpleResponse(message)
    .addSuggestions(suggestions));

  savePhrase(app, {
    message,
    reprompt,
    suggestions,
  });
};
