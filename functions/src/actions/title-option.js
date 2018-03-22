const dialog = require('../dialog');
const playback = require('../state/playback');
const strings = require('../strings').intents.titleOption;
const {debug} = require('../utils/logger')('ia:actions:title-option');

function handler (app) {
  debug('start');
  const value = app.getArgument('value');
  debug('got value:', value);
  playback.setMuteSpeechBeforePlayback(app, value === 'false');
  dialog.ask(app, strings[value]);
}

module.exports = {
  handler,
};
