/**
 * Handle Alexa PlaybackController.PreviousCommandIssued
 */
const playbackPrevious = require('./playback/previous');

module.exports = {
  handler: playbackPrevious.handler,
};
