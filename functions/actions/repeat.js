const dialog = require('../dialog');
const {getLastMessage, getLastReprompt, getLastSuggestions} = require('../state/dialog');

/**
 * handle repeat intent
 *
 * @param app
 */
function handler (app) {
  console.log('repeat handler');
  // TODO: repeat currently playing song
  // play(app, 0);
  const message = getLastMessage(app);
  const reprompt = getLastReprompt(app);
  const suggestions = getLastSuggestions(app);
  console.log(message, reprompt, suggestions);
  dialog.ask(app, message, reprompt, suggestions);
  console.log('repeat handler after');
}

module.exports = {
  handler,
};
