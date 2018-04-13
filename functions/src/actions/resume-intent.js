const dialog = require('../dialog');
const dialogState = require('../state/dialog');
const playlist = require('../state/playlist');
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
 * TODO: but maybe it would be useful for Actions of Google
 * in case of new session for returned user
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
    .then(() => {
      return parepareSongData()
        .then(fulfilResolvers())
        .then(renderSpeech())
        .then(playSong())
        .catch(context => {
          debug('It could be an error:', context);
          return dialog.ask(app, strings.intents.resume.fail);
        });
    }, () => {
      dialog.ask(app, dialog.merge({
        speech: dialogState.getLastReprompt(app),
        reprompt: dialogState.getLastReprompt(app),
        suggestions: dialogState.getLastSuggestions(app),
      }, strings.intents.resume.empty));
    });
}

module.exports = {
  handler,
};
