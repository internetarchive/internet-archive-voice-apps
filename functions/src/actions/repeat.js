const dialog = require('../dialog');

const {getLastPhrase} = require('../state/dialog');
const {debug} = require('../utils/logger')('ia:actions.repeat');

/**
 * handle repeat intent
 *
 * @param app
 */
function handler (app) {
  debug('start');
  // TODO: repeat currently playing song
  // play(app, 0);
  dialog.ask(app, getLastPhrase(app));
}

module.exports = {
  handler,
};
