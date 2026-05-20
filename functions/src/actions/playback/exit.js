const dialog = require('../../dialog');
const query = require('../../state/query');
const strings = require('../../strings').intents.exit;
const selectors = require('../../configurator/selectors');

/**
 * Handle exit intent during playback state.
 * Stops audio playback AND says goodbye, clearing the AudioPlayer screen.
 *
 * Without this, exit during playback falls back to the top-level exit handler
 * which only closes the session with speech but doesn't send AudioPlayer.Stop,
 * leaving the display card on screen.
 */
function handler (app) {
  // Stop the AudioPlayer (sends AudioPlayer.Stop directive + shouldEndSession:true)
  app.stopPlayback();
  // Say goodbye speech
  dialog.close(app, selectors.find(strings, query.getSlots(app)));
}

module.exports = {
  handler,
};
