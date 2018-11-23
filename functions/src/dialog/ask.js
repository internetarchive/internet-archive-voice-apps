const { savePhrase } = require('../state/dialog');
const { debug } = require('../utils/logger')('ia:dialog:ask');

/**
 * ask user with suggestions
 *
 * @param app
 * @param speech {string} assistant will speak it
 * @param text {string|null} visualization of speech,
 * if isn't defined it will be the same as speech
 * @param reprompt {string}
 * @param suggestions {array}
 */
module.exports = function (app, { speech, text = null, reprompt = undefined, suggestions = undefined }) {
  debug('ask', speech, reprompt, suggestions);

  if (typeof app === 'string') {
    throw new Error(`Argument 'app' should be Dialogflow App object but we get ${app}`);
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

  app.response({ speech, text, reprompt, suggestions });
};
