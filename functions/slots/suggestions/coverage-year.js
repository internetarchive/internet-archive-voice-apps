const albumsProvider = require('../../provider/albums');

/**
 * Return list of coverage year pair
 *
 * @param slots
 * @returns {Promise.<{items: Array}>}
 */
function handle (slots) {
  return albumsProvider
    .fetchAlbums(
      slots.creatorId, {
        sort: 'downloads+desc',
      }
    );
}

module.exports = {
  handle,
  slots: ['coverage', 'year'],
};
