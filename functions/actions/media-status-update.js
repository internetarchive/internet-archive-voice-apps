const debug = require('debug')('ia:actions:media-status-update:debug');
const warning = require('debug')('ia:actions:media-status-update:warn');

const dialog = require('../dialog');
const feeders = require('../extensions/feeders');
const playlist = require('../state/playlist');
const query = require('../state/query');

/**
 * handle 'media status update' action
 *
 * @param app
 */
function handler (app) {
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
 * handle app.Media.Status.FINISHED media status
 *
 * @param app
 */
function handleFinished (app) {
  debug(`handle media action`);
  const feederName = playlist.getFeeder(app);
  debug(`playlist is based on "${feederName}" feeder`);

  let feeder = feeders.getByName(feederName);
  if (!feeder || !feederName) {
    warning('we got detached playlist chunk');
    dialog.ask(app, {speech: 'Playlist is ended. Do you want to listen something more?'});
    return Promise.resolve();
  }

  if (feeder.hasNext({app, query, playlist})) {
    debug('move to the next song');
    return feeder
      .next({app, query, playlist})
      .then(() => {
        debug('ok, we get new song and now could play it');
        dialog.playSong(app, feeder.getCurrentItem({app, playlist}));
      });
  } else {
    // TODO: react when we reach the end of playlist
    dialog.ask(app, {speech: 'Playlist is ended. Do you want to listen something more?'});
    return Promise.resolve();
  }
}

module.exports = {
  handler,
};
