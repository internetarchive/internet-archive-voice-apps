const mustache = require('mustache');

const dialog = require('../dialog');
const fsm = require('../state/fsm');
const helpStrings = require('../strings').intents.help;

/**
 * handle version intent
 *
 * @param app
 */
function handler (app) {
  const state = fsm.getState(app);
  switch (state) {
    case 'playback':
      dialog.ask(app, {
        speech: mustache.render(helpStrings.playback, {state}),
      });
      break;
    case 'playback-is-stoped':
      // execute case y code block
      break;
    case 'search-music':
      // execute case y code block
      break;
    default:
      // execute default code block
  }
}

module.exports = {
  handler,
};
