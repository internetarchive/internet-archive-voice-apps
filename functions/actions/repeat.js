const dialog = require('../dialog');
const {getLastPhrase, getLastReprompt} = require('../state/context');

/**
 * handle repeat intent
 *
 * @param app
 */
function handler (app) {
  // TODO: repeat currently playing song
  // play(app, 0);
  const phrase = getLastPhrase(app);
  const reprompt = getLastReprompt(app);
  dialog.ask(app, phrase.message, reprompt, phrase.suggestions);
}

module.exports = {
  handler,
};
