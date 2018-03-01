const sinon = require('sinon');

/**
 * Mock of provider/collection
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
