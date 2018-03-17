const playback = require('../../state/playback');
const strings = require('../../strings').dialog.playSong;
const {debug} = require('../../utils/logger')('ia:dialog:middlewares:replace-speech-if-muted');

/**
 * Process options before play audio
 *
 * @param options
 * @param options.muteSpeech {Boolean} - Mute speech before play audio
 * @returns {Object}
 */
function replaceSpeechIfMutedMiddleware (app, options) {
  debug('start');
  if (playback.isMuteSpeechBeforePlayback(app)) {
    debug('apply');
    return Object.assign({}, options, {speech: strings.speech});
  }
  debug('skip');
  return options;
}

module.exports = () => replaceSpeechIfMutedMiddleware;
