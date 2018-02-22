const dialog = require('../dialog');
const {getLastSpeech, getLastReprompt, getLastSuggestions} = require('../state/dialog');

/**
 * handle repeat intent
 *
 * @param app
 */
function handler (app) {
  // TODO: repeat currently playing song
  // play(app, 0);
  const speech = getLastSpeech(app);
  const reprompt = getLastReprompt(app);
  const suggestions = getLastSuggestions(app);
  dialog.ask(app, {speech, reprompt, suggestions});
}

module.exports = {
  handler,
};
