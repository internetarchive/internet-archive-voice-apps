/**
 * Playback settings
 */
const {getData} = require('./helpers').group('playback', {
  muteSpeech: true,
});

/**
 * Should we mute description speech before playback
 *
 * @param app
 * @returns {Boolean}
 */
const isMuteSpeechBeforePlayback = (app) => getData(app).muteSpeech;

module.exports = {
  isMuteSpeechBeforePlayback,
};
