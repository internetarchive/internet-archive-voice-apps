const dialog = require('../../dialog');
const dialogState = require('../../state/dialog');
const strings = require('../../strings');
const {debug} = require('../../utils/logger')('ia:actions:playback/no-input');

const feederFromPlaylist = require('../_high-order-handlers/middlewares/feeder-from-playlist');

const helpers = require('./_helpers');

function handler (app) {
  return helpers.playSong({app, next: false})
    .catch(err => {
      if (err instanceof feederFromPlaylist.EmptyFeederError) {
        dialog.ask(app, dialog.merge(
          strings.intents.resume.empty,
          dialogState.getReprompt(app)
        ));
      } else {
        debug('It could be an error:', err);
        return dialog.ask(app, dialog.merge(
          strings.intents.resume.fail,
          dialogState.getReprompt(app)
        ));
      }
    });
}

module.exports = {
  handler,
};
