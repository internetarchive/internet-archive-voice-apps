const {debug, warning} = require('../utils/logger')('ia:actions:media-status-update');

const dialog = require('../dialog');
const playlist = require('../state/playlist');
const query = require('../state/query');
const strings = require('../strings');

const feederFromPlaylist = require('./high-order-handlers/middlewares/feeder-from-playlist');
const fulfilResolvers = require('./high-order-handlers/middlewares/fulfil-resolvers');
const nextSong = require('./high-order-handlers/middlewares/next-song');
const playSong = require('./high-order-handlers/middlewares/play-song');
const parepareSongData = require('./high-order-handlers/middlewares/song-data');
const renderSpeech = require('./high-order-handlers/middlewares/render-speech');

/**
 * handle 'media status update' action
 *
 * Actions of Google specific intent
 *
 * FIXME: Maybe we should handle this intent this way:
 *
 * https://developers.google.com/actions/assistant/responses
 * > Your Assistant app should handle the actions.intent.MEDIA_STATUS
 * > built-in intent to prompt user for follow-up.
 *
 * @param app
 */
function handler (app) {
  debug('start');
  let mediaStatus;
  if (app.getArgument) {
    // @deprecated
    mediaStatus = app.getArgument('MEDIA_STATUS');
  } else {
    mediaStatus = app.params.getByName('MEDIA_STATUS');
  }

  const status = mediaStatus.status;

  if (status === 'FINISHED') {
    return handleFinished(app);
  } else {
    // log that we got unknown status
    // for example (app.Media.Status.UNSPECIFIED)
    warning(`Got unexpected media update ${status}`);
    return Promise.resolve();
  }
}

function prepareNextSong (ctx) {
  debug('prepare next song');
  return feederFromPlaylist()(Object.assign({}, ctx, {query, playlist}))
  // expose current platform to the slots
    .then(ctx =>
      Object.assign({}, ctx, {
        slots: Object.assign(
          {}, ctx.slots, {platform: ctx.app.platform || 'assistant'}
        )
      })
    )
    .then(nextSong())
    .then(context => {
      debug('we got new song and now could play it');
      return parepareSongData()(context);
    })
    .then(fulfilResolvers())
    .then(renderSpeech());
}

/**
 * Handle app.Media.Status.FINISHED media status
 *
 * @param app
 */
function handleFinished (app) {
  debug('handle finished');
  return prepareNextSong({app, query, playlist})
    .then(playSong())
    .catch(context => {
      debug('It could be an error:', context);
      return dialog.ask(app, strings.events.playlistIsEnded);
    });
}

module.exports = {
  handler,
  handleFinished,
  prepareNextSong,
};
