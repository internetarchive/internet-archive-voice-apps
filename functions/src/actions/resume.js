const dialog = require('../dialog');
const dialogState = require('../state/dialog');
const strings = require('../strings');
const { debug } = require('../utils/logger')('ia:actions:resume-intent');

const feederFromPlaylist = require('./_high-order-handlers/middlewares/feeder-from-playlist');

const helpers = require('./playback/_helpers');

/**
 * handle ALEXA.ResumeIntent
 * and resume intent of Action of Google
 *
 * @param app
 */
function handler (app) {
  return helpers.playSong({ app, next: false })
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
