const {debug} = require('../../utils/logger')('ia:actions:playback/repeat');

const dialog = require('../../dialog');
const strings = require('../../strings');

const helpers = require('./_helpers');

/**
 * handle repeat intent
 *
 * @param app
 */
function handler (app) {
  return helpers.playSong({app, next: false})
    .catch(context => {
      debug('It could be an error:', context);
      return dialog.ask(app, strings.intents.repeat.empty);
    });
}

module.exports = {
  handler,
};
