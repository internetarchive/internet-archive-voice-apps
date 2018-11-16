const albumsProvider = require('../../provider/albums');
const { debug } = require('../../utils/logger')('ia:suggestions:years');

/**
 * Return list of coverage year pair
 *
 * @param app
 * @param slots
 * @returns {Promise.<{items: Array}>}
 */
function handle ({ app, slots }) {
  debug('start');
  debug('context:', slots);
  return albumsProvider
    .fetchAlbumsByQuery(
      app,
      Object.assign({}, slots, {
        limit: 3,
        fields: 'coverage,year',
        order: 'best',
      })
    );
}

module.exports = {
  handle,
  slots: ['coverage', 'year'],
};
