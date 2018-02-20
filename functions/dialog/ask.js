const {savePhrase} = require('../state/dialog');

/**
 * ask user with suggestions
 *
 * @param app
 * @param message
 * @param reprompt
 * @param suggestions
 */
module.exports = function (app, message, reprompt = null, suggestions = null) {
  app.ask(app.buildRichResponse()
    .addSimpleResponse(message)
    .addSuggestions(suggestions));

  savePhrase(app, {
    message,
    reprompt,
    suggestions,
  });
};
