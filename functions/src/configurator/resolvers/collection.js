const collection = require('../../../provider/collection');
const {debug} = require('../../../utils/logger')('ia:resolver:collection');

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
