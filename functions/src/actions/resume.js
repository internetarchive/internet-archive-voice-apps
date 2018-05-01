const dialog = require('../dialog');
const dialogState = require('../state/dialog');
const playlist = require('../state/playlist');
const playback = require('../state/playback');
const query = require('../state/query');
const strings = require('../strings');
const {debug} = require('../utils/logger')('ia:actions:resume-intent');

const feederFromPlaylist = require('./high-order-handlers/middlewares/feeder-from-playlist');
const fulfilResolvers = require('./high-order-handlers/middlewares/fulfil-resolvers');
const playSong = require('./high-order-handlers/middlewares/play-song');
const parepareSongData = require('./high-order-handlers/middlewares/song-data');
const renderSpeech = require('./high-order-handlers/middlewares/render-speech');

/**
 * handle ALEXA.ResumeIntent
 * and resume intent of Action of Google
 *
 * @param app
 */
function handler (app) {
  return feederFromPlaylist()({
    app,
    playlist,
    query,
    slots: {platform: app.platform}
  })
    .then(ctx => {
      return parepareSongData()(ctx)
        .then(fulfilResolvers())
        .then(renderSpeech())
        .then(playSong({offset: playback.getOffset(app)}))
        .catch(context => {
          debug('It could be an error:', context);
          return dialog.ask(app, dialog.merge(
            strings.intents.resume.fail,
            dialogState.getReprompt(app)
          ));
        });
    }, () => {
      dialog.ask(app, dialog.merge(
        strings.intents.resume.empty,
        dialogState.getReprompt(app)
      ));
    });
}

module.exports = {
  handler,
};
