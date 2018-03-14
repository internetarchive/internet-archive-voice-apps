const mustache = require('mustache');

const config = require('../config');

/**
 * Get full url to song by id of album and filename of song
 *
 * @param albumId {string}
 * @param filename {string}
 * @returns {string}
 */
function getSongUrlByAlbumIdAndFileName (albumId, filename) {
  return mustache.render(config.endpoints.SONG_URL, {albumId, filename});
}

module.exports = {
  getSongUrlByAlbumIdAndFileName,
};
