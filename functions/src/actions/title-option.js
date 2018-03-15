const dialog = require('../dialog');
const playback = require('../state/playback');
const strings = require('../strings').intents.titleOption;

function handler (app) {
  const value = app.getArgument('value');
  console.log('value', value);
  playback.setMuteSpeechBeforePlayback(app, value === 'false');
  dialog.ask(app, strings[value]);
}

module.exports = {
  handler,
};
