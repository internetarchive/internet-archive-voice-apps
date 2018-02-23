const sinon = require('sinon');

/**
 * Mock of search/collection
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
