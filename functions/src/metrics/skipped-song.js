const axios = require('axios');

const config = require('../config');
const endpointProcessor = require('../network/endpoint-processor');

/**
 * Send metrics: Skip song
 *
 * details:
 * https://github.com/internetarchive/internet-archive-voice-apps/wiki/metrics#skipped-songs
 *
 * @param app
 * @param props
 * @returns {*}
 */
module.exports = function skippedSong (app, props) {
  return axios.head(
    endpointProcessor.preprocess(config.metrics.skip_song, app, props)
  );
};
