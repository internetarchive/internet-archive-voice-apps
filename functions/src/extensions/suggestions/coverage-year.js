const albumsProvider = require('../../provider/albums');
const {debug} = require('../../utils/logger')('ia:suggestions:years');

const MAX_ITEMS = 20000;

/**
 * Return list of coverage year pair
 *
 * @param app
 * @param slots
 * @returns {Promise.<{items: Array}>}
 */
function handle ({app, slots}) {
  debug('start');
  debug('context:', slots);
  return albumsProvider
    .fetchAlbumsByQuery(
      app,
      Object.assign({}, slots, {
        limit: MAX_ITEMS,
        fields: 'coverage,year',
        order: 'downloads+desc',
      })
    );
}

module.exports = {
  handle,
  slots: ['coverage', 'year'],
};
