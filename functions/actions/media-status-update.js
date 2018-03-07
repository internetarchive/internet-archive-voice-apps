const debug = require('debug')('ia:actions:media-status-update:debug');
const warning = require('debug')('ia:actions:media-status-update:warn');

const dialog = require('../dialog');
const feeders = require('../extensions/feeders');
const playlist = require('../state/playlist');

/**
 * handle 'media status update' action
 *
 * @param app
 */
function handler (app) {
  const status = app.getArgument('MEDIA_STATUS').extension.status;

  if (status === app.Media.Status.FINISHED) {
    handleFinished(app);
  } else {
    // log that we got unknown status
    // for example (app.Media.Status.UNSPECIFIED)
    warning(`Got unexpected media update ${status}`);
  }
}

/**
 * handle app.Media.Status.FINISHED media status
 *
 * @param app
 */
function handleFinished (app) {
  debug(`handle media action`);
  const feederName = playlist.getFeeder(app);

  let feeder = feeders.getByName(feederName);
  if (feeder && feederName) {
    warning('we have detached playlist chunk');
    feeder = playlist;
  }

  if (playlist.hasNextSong(app)) {
    // TODO: we should fetch new songs
    playlist.next(app);
    dialog.playSong(app, playlist.getCurrentSong(app));
  } else {
    // TODO: react when we reach the end of playlist
    dialog.ask(app, {speech: 'Playlist is ended. Do you want to listen something more?'});
  }
}

module.exports = {
  handler,
};
