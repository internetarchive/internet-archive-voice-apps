const playback = require('../../state/playback');
const strings = require('../../strings').dialog.playSong;

/**
 * Process options before play audio
 *
 * @param options
 * @param options.muteSpeech {Boolean} - Mute speech before play audio
 * @returns {Object}
 */
function replaceSpeechIfMutedMiddleware (app, options) {
  if (playback.isMuteSpeechBeforePlayback(app)) {
    return Object.assign({}, options, {speech: strings.speech});
  }
  return options;
}

module.exports = () => replaceSpeechIfMutedMiddleware;
