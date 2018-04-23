const {Suggestions} = require('actions-on-google');

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

  if (app.ask) {
    debug('depricated');
    // @depricated
    if (!suggestions) {
      debug('app.ask without suggestions');
      app.ask(speech);
    } else {
      if (Array.isArray(suggestions)) {
        suggestions = suggestions.map(s => s.toString());
      }

      debug('app.ask with suggestions');
      app.ask(new Suggestions(suggestions), speech);
    }
    debug('after app.ask');
    return;
  }

  if (Array.isArray(suggestions)) {
    suggestions = suggestions.map(s => s.toString());
  }

  debug('before app.response');
  app.response({speech, reprompt, suggestions});
  debug('after app.response');
};
