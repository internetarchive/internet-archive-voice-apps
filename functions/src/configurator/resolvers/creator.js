const collection = require('../../provider/collection');
const { debug } = require('../../utils/logger')('ia:resolvers:creator');

/**
 * Handle context to fetch creator details
 *
 * @param creatorId
 * @returns {Promise}
 */
function handler ({ app, slots } = {}) {
  if (!slots) {
    return Promise.resolve();
  }
  debug('start handling', slots.creatorId);
  return collection.fetchDetails(app, slots.creatorId);
}

module.exports = {
  requirements: ['creatorId'],
  handler,
};
