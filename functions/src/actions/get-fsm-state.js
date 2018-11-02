const mustache = require('mustache');

const dialog = require('../dialog');
const fsm = require('../state/fsm');
const strings = require('../strings').intents.getFSMState;
const { debug } = require('../utils/logger')('ia:actions:fsm-current-state');

/**
 * Debug handler.
 *
 * @param app
 */
function handler (app) {
  const state = fsm.getLastState(app);
  debug('fsm state:', state);
  dialog.ask(app, {
    speech: mustache.render(strings.speech, { state }),
  });

  // TODO: continue last action
  // in case of playback we should continue playback of song
  // otherwise we should ask the last question
}

module.exports = {
  handler,
};
