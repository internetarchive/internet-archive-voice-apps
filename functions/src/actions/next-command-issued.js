/**
 * Handle Alexa PlaybackController.NextCommandIssued
 */
const playbackNext = require('./playback/next');

module.exports = {
  handler: playbackNext.handler,
};
