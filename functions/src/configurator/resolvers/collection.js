const collection = require('../../../provider/collection');
const {debug} = require('../../../utils/logger')('ia:resolver:collection');

/**
 * Handle context to fetch collection details
 *
 * @param collectionId
 * @returns {Promise}
 */
function handler ({app, slots} = {}) {
  if (!slots) {
    return Promise.resolve();
  }
  debug('start handling', slots.collectionId);
  return collection.fetchDetails(app, slots.collectionId);
}

module.exports = {
  requirements: ['collectionId'],
  handler,
};
