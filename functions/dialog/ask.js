const debug = require('debug')('ia:ask');
debug.log = console.log.bind(console);
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
  debug('ask', message, suggestions);
  app.ask(app.buildRichResponse()
    .addSimpleResponse(message)
    .addSuggestions(suggestions));

  savePhrase(app, {
    message,
    reprompt,
    suggestions,
  });
};
