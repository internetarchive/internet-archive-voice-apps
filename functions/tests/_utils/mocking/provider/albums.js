const sinon = require('sinon');

/**
 * Mock of search/albums
 *
 * @param fetchAlbumsResolve
 * @returns {{fetchDetails: *}}
 */
module.exports = function ({
  fetchAlbumDetailsResolve = null,
  fetchAlbumDetailsReject = null,
  fetchAlbumsResolve = null,
  fetchAlbumsByQueryResolve = null,
} = {}) {
  return {
    fetchAlbums: sinon.stub().returns(Promise.resolve(fetchAlbumsResolve)),
    fetchAlbumsByQuery: sinon.stub().returns(Promise.resolve(fetchAlbumsByQueryResolve)),
    fetchAlbumDetails: sinon.stub().returns(
      fetchAlbumDetailsResolve ? Promise.resolve(fetchAlbumDetailsResolve)
        : fetchAlbumDetailsReject && Promise.resolve(fetchAlbumDetailsReject)
    ),
  };
};
