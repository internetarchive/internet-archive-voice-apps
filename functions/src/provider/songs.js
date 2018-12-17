const config = require('../config');
const endpointProcessor = require('../network/endpoint-processor');

/**
 * Get full url to song by id of album and filename of song
 *
 * @param app
 * @param ops {{albumId:string, filename:string}}
 * @returns {string}
 */
function getSongUrlByAlbumIdAndFileName (app, ops) {
  return endpointProcessor.preprocess(config.endpoints.SONG_URL, app, ops);
}

module.exports = {
  getSongUrlByAlbumIdAndFileName,
};
