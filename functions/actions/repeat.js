const dialog = require('../dialog');
const {getLastMessage, getLastReprompt, getLastSuggestions} = require('../state/dialog');

/**
 * handle repeat intent
 *
 * @param app
 */
function handler (app) {
  // TODO: repeat currently playing song
  // play(app, 0);
  const message = getLastMessage(app);
  const reprompt = getLastReprompt(app);
  const suggestions = getLastSuggestions(app);
  dialog.ask(app, message, reprompt, suggestions);
}

module.exports = {
  handler,
};
