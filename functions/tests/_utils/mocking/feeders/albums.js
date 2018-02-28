const sinon = require('sinon');

/**
 * Mock of feeder/albums
 *
 * @param fetchAlbumsResponse
 * @returns {{fetchDetails: *}}
 */
module.exports = function ({
                             fetchAlbumDetailsResolve = null,
                             fetchAlbumDetailsReject = null,
                             getSongUrlByAlbumIdAndFileNameReturns = null
                           } = {}) {
  return {
    fetchAlbumDetails: sinon.stub().returns(
      fetchAlbumDetailsResolve && Promise.resolve(fetchAlbumDetailsResolve) ||
      fetchAlbumDetailsReject && Promise.resolve(fetchAlbumDetailsReject)
    ),
    getSongUrlByAlbumIdAndFileName: sinon.stub().returns(getSongUrlByAlbumIdAndFileNameReturns),
  };
};
