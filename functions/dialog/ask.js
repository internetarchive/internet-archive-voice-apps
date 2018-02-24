const debug = require('debug')('ia:dialog:ask:debug');
debug.log = console.log.bind(console);
const {savePhrase} = require('../state/dialog');

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

  savePhrase(app, {
    speech,
    reprompt,
    suggestions,
  });

  app.ask(app.buildRichResponse()
    .addSimpleResponse(speech)
    .addSuggestions(suggestions));
};
