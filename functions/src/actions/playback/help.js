const constants = require('../../constants');
const fsm = require('../../state/fsm');
const strings = require('../../strings');

const helpers = require('../_helpers');

module.exports = {
  handler: (app) => {
    fsm.transitionTo(app, constants.fsm.states.HELP);
    helpers.simpleResponse(app, strings.intents.help.playback.default);
  }
};
