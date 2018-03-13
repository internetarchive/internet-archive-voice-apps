const debug = require('debug')('ia:resolver:collection');

const collection = require('../../../provider/collection');

/**
 * Handle context to fetch collection details
 *
 * @param collectionId
 * @returns {Promise}
 */
function handler ({collectionId} = {}) {
  debug('start handling', collectionId);
  return collection.fetchDetails(collectionId);
}

module.exports = {
  requirements: ['collectionId'],
  handler,
};
