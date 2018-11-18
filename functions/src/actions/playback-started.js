const { debug, error } = require('../utils/logger')('ia:actions:playback-started');
const playlist = require('../state/playlist');

function handler (app) {
  // TODO: set playbackFinished
  // could be useful to resume playback
  // https://github.com/alexa/skill-sample-nodejs-audio-player/blob/1da04690933aab0a2711be6075becf67004a1896/multiple-streams/lambda/src/stateHandlers.js#L83

  // find the record by its token and set current cursor to this po
  const song = playlist.getItemByToken(app, app.params.getByName('token'));
  if (!song) {
    error('we do not have this song in playlist');
    debug('playlist: ', playlist.getItems(app));
    return;
  }

  if (song.current) {
    updateSourceCursor({ app, playlist }, song.current);
  }

  playlist.moveTo(app, song);
}

function updateSourceCursor ({ app, playlist }, current) {
  playlist.setExtra(app, {
    ...playlist.getExtra(app),
    cursor: {
      ...playlist.getExtra(app).cursor,
      current: current,
    },
  });
}


/**
 * handle Alexa AudioPlayer.PlaybackStarted intent
 * @type {{handler: handler}}
 */
module.exports = {
  handler,
};
