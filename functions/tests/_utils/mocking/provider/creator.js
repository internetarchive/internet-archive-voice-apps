const sinon = require('sinon');

/**
 * Mock of search/creator
 *
 * @param fetchDetailsResponse
 * @returns {{fetchDetails: *}}
 */
module.exports = function ({
                             fetchDetailsResponse = null,
                           } = {}) {
  return {
    fetchDetails: sinon.stub().returns(Promise.resolve(fetchDetailsResponse)),
  };
};
