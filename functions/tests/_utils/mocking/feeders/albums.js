const sinon = require('sinon');

/**
 * Mock of feeder/albums
 *
 * @param fetchAlbumsResponse
 * @returns {{fetchDetails: *}}
 */
module.exports = function ({
  getCurrentItemReturns = null,
} = {}) {
  return {
    build: sinon.stub().returns(Promise.resolve()),
    getCurrentItem: sinon.stub().returns(getCurrentItemReturns),
    isEmpty: sinon.stub().returns(false),
  };
};
