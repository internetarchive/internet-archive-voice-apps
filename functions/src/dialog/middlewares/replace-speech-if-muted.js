const selectors = require('../../configurator/selectors');
const playback = require('../../state/playback');
const {debug} = require('../../utils/logger')('ia:dialog:middlewares:replace-speech-if-muted');

module.exports = (availableStrings) => {
  /**
   * Process options before play audio
   * by replacing speech if we decide to mute speech before play song
   *
   * @param options
   * @param options.muteSpeech {Boolean} - Mute speech before play audio
   * @returns {Object}
   */
  function replaceSpeechIfMutedMiddleware (app, options) {
    debug('start');
    const strings = selectors.find(availableStrings, options);
    if (playback.isMuteSpeechBeforePlayback(app)) {
      debug('apply speech');
      return Object.assign({}, options, {speech: strings.speech});
    }
    debug('skip');
    return options;
  }

  return replaceSpeechIfMutedMiddleware;
};
