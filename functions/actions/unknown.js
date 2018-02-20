const dialog = require('../dialog');
const {getLastReprompt, getLastSuggestions} = require('../state/dialog');
const {getLastAction, getLastRepetitionCount} = require('../state/repetition');
const intentStrings = require('../strings').intents.unknown;


/**
 * handle no-input intent
 *
 * @param app
 */
function handler (app) {
  let count = 0;

  //TODO: should works implicitly (without 'unknown')
  if (getLastAction(app) === 'unknown') {
    count = getLastRepetitionCount(app);
  }

  const suggestions = getLastSuggestions(app);

  switch (count) {
    case 0:
      dialog.ask(app, intentStrings.first, suggestions);
      break;
    case 1:
      dialog.ask(
        app,
        intentStrings.reprompt.replace('${reprompt}', getLastReprompt(app)),
        suggestions
      );
      break;
    default:
      dialog.tell(app, intentStrings.fallback);
      break;
  }
}

module.exports = {
  handler,
};
