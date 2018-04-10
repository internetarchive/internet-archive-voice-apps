const {debug, warning} = require('../utils/logger')('ia:actions:media-status-update');

const dialog = require('../dialog');
const playlist = require('../state/playlist');
const query = require('../state/query');

const feederFromPlaylist = require('./high-order-handlers/middlewares/feeder-from-playlist');
const fulfilResolvers = require('./high-order-handlers/middlewares/fulfil-resolvers');
const nextSong = require('./high-order-handlers/middlewares/next-song');
const playSong = require('./high-order-handlers/middlewares/play-song');
const parepareSongData = require('./high-order-handlers/middlewares/song-data');
const renderSpeech = require('./high-order-handlers/middlewares/render-speech');

/**
 * handle 'media status update' action
 *
 * @param app
 */
function handler (app) {
  debug('start');
  const status = app.getArgument('MEDIA_STATUS').extension.status;

  if (status === app.Media.Status.FINISHED) {
    return handleFinished(app);
  } else {
    // log that we got unknown status
    // for example (app.Media.Status.UNSPECIFIED)
    warning(`Got unexpected media update ${status}`);
    return Promise.resolve();
  }
}

/**
 * Handle app.Media.Status.FINISHED media status
 *
 * @param app
 */
function handleFinished (app) {
  debug('handle finished');
  return feederFromPlaylist()({app, query, playlist})
    .then(nextSong())
    .then(context => {
      debug('we got new song and now could play it');
      return parepareSongData()(context)
        .then(fulfilResolvers())
        .then(renderSpeech())
        .then(playSong());
    })
    .catch(context => {
      debug('It could be an error:', context);
      return dialog.ask(app, {speech: 'Playlist is ended. Do you want to listen something more?'});
    });
}

module.exports = {
  handler,
};
