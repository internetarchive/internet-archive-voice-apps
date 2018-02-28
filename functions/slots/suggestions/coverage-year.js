const creator = require('../../provider/creator');

/**
 * Return list of coverage year pair
 *
 * @param slots
 * @returns {Promise.<{items: Array}>}
 */
function handler (slots) {
  return creator
    .fetchAlbums(
      slots.creatorId, {
        sort: 'downloads+desc',
      }
    );
}

module.exports = {
  handler,
  slots: ['coverage', 'year'],
};
