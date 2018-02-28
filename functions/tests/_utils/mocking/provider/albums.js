const sinon = require('sinon');

/**
 * Mock of search/creator
 *
 * @param fetchAlbumsResolve
 * @returns {{fetchDetails: *}}
 */
module.exports = function ({
  fetchAlbumsResolve = null,
  fetchAlbumsByQueryResolve = null,
} = {}) {
  return {
    fetchAlbums: sinon.stub().returns(Promise.resolve(fetchAlbumsResolve)),
    fetchAlbumsByQuery: sinon.stub().returns(Promise.resolve(fetchAlbumsByQueryResolve)),
  };
};
