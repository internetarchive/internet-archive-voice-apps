const debug = require('debug')('ia:ask');
debug.log = console.log.bind(console);
const {savePhrase} = require('../state/dialog');

/**
 * ask user with suggestions
 *
 * @param app
 * @param speech
 * @param reprompt
 * @param suggestions
 */
module.exports = function (app, {speech, reprompt = null, suggestions = null}) {
  debug('ask', speech, suggestions);

  savePhrase(app, {
    speech,
    reprompt,
    suggestions,
  });

  app.ask(app.buildRichResponse()
    .addSimpleResponse(speech)
    .addSuggestions(suggestions));
};
