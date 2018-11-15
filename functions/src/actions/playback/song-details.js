const mustache = require('mustache');

const dialog = require('../../dialog/index');
const playlistState = require('../../state/playlist');
const strings = require('../../strings').intents.songsDetails;
const { error } = require('../../utils/logger/index')('ia:actions:resume-intent');

const playbackHelpers = require('./_helpers');

function handler (app) {
  const song = playlistState.getCurrentSong(app);

  dialog.ask(app, {
    speech: mustache.render(strings.action.speech, song)
  });

  // resume playback
  if (strings.action.resumePlayback) {
    return playbackHelpers.resume({ app });
  } else {
    error('is not implemented');
  }
}

module.exports = {
  handler,
};
