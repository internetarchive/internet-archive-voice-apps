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

/**
 * Get current played track offest
 *
 * @param app
 */
const getOffset = (app) => getData(app).offset || 0;

/**
 * Set current played track offset
 *
 * @param app
 * @param offset
 */
const setOffset = (app, offset) =>
  setData(app, Object.assign({}, getData(app), {
    offset,
  }));

module.exports = {
  isMuteSpeechBeforePlayback,
  setMuteSpeechBeforePlayback,

  getOffset,
  setOffset,
};
