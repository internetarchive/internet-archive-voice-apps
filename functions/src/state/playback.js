/**
 * Playback settings
 */
const {getData, setData} = require('./helpers').group('playback', {
  muteSpeech: true,
});

/**
 * Should we mute description speech before playback
 *
 * @param app
 * @returns {Boolean}
 */
const isMuteSpeechBeforePlayback = (app) => getData(app).muteSpeech;

/**
 * Define (un-)mute description speech before playback
 *
 * @param app
 * @param muteSpeech {Boolean}
 */
const setMuteSpeechBeforePlayback = (app, muteSpeech) =>
  setData(app, Object.assign({}, getData(app), {
    muteSpeech,
  }));

module.exports = {
  isMuteSpeechBeforePlayback,
  setMuteSpeechBeforePlayback,
};
