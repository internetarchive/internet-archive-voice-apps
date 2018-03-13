const debug = require('debug')('ia:resolver:creator');

const collection = require('../../../provider/collection');

/**
 * Handle context to fetch creator details
 *
 * @param creatorId
 * @returns {Promise}
 */
function handler ({creatorId} = {}) {
  debug('start handling', creatorId);
  return collection.fetchDetails(creatorId);
}

module.exports = {
  requirements: ['creatorId'],
  handler,
};
