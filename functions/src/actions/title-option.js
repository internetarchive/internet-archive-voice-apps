const dialog = require('../dialog');
const playback = require('../state/playback');
const strings = require('../strings').intents.titleOption;
const { debug } = require('../utils/logger')('ia:actions:title-option');

function handler (app) {
  debug('start');
  let value;
  if (app.getArgument) {
    // @deprecated
    value = app.getArgument('value');
  } else {
    value = app.params.getByName('value');
  }
  debug('got value:', value);
  value = value === 'false';
  playback.setMuteSpeechBeforePlayback(app, value);
  dialog.ask(app, strings[value]);
}

module.exports = {
  handler,
};
