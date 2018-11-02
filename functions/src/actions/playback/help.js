const selectors = require('../../configurator/selectors');
const constants = require('../../constants');
const dialog = require('../../dialog');
const { getLastPhrase } = require('../../state/dialog');
const fsm = require('../../state/fsm');
const { getCurrentSong } = require('../../state/playlist');
const { getSlots } = require('../../state/query');
const strings = require('../../strings').intents.help;

const helpers = require('../_helpers');

function handler (app) {
  const ctx = Object.assign({}, {
    last: getLastPhrase(app),
    slots: getSlots(app),
    playback: getCurrentSong(app),
  });

  fsm.transitionTo(app, constants.fsm.states.HELP);

  dialog.ask(app, helpers.substitute(selectors.find(strings.playback.default, ctx), ctx));
}

module.exports = {
  handler,
};
