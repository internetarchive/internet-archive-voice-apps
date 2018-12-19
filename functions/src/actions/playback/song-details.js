const mustache = require('mustache');

const dialog = require('../../dialog');
const playlistState = require('../../state/playlist');
const scheme = require('../../strings').intents.songDetails;
const { error } = require('../../utils/logger')('ia:actions:resume-intent');

const playbackHelpers = require('./_helpers');

function handler (app) {
  const song = playlistState.getCurrentSong(app);

  dialog.ask(app, {
    speech: mustache.render(scheme.playback.speech, song)
  });

  // resume playback
  if (scheme.playback.resumePlayback) {
    return playbackHelpers.resume({ app });
  } else {
    error('is not implemented');
  }
}

module.exports = {
  handler,
};
