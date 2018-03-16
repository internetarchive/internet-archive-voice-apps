const albumsProvider = require('../../provider/albums');

/**
 * Return list of coverage year pair
 *
 * @param slots
 * @returns {Promise.<{items: Array}>}
 */
function handle (slots) {
  return albumsProvider
    .fetchAlbumsByQuery(
      Object.assign({}, slots, {
        order: 'downloads+desc',
      })
    );
}

module.exports = {
  handle,
  slots: ['coverage', 'year'],
};
