const sinon = require('sinon');

/**
 * Mock of search/creator
 *
 * @param fetchAlbumsResponse
 * @returns {{fetchDetails: *}}
 */
module.exports = function ({
                             fetchAlbumsResponse = null,
                           } = {}) {
  return {
    fetchAlbums: sinon.stub().returns(Promise.resolve(fetchAlbumsResponse)),
  };
};
