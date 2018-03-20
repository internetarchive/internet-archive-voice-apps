const collection = require('../../provider/collection');
const {debug} = require('../../utils/logger')('ia:resolver:creator');

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
