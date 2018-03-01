const sinon = require('sinon');

/**
 * Mock of provider/songs
 *
 * @param fetchAlbumsResponse
 * @returns {{fetchDetails: *}}
 */
module.exports = function ({
  getSongUrlByAlbumIdAndFileNameReturns = null
} = {}) {
  return {
    getSongUrlByAlbumIdAndFileName: sinon.stub().returns(getSongUrlByAlbumIdAndFileNameReturns),
  };
};
