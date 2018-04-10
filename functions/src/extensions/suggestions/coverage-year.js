const albumsProvider = require('../../provider/albums');
const {debug} = require('../../utils/logger')('ia:suggestions:years');

const MAX_ITEMS = 20000;

/**
 * Return list of coverage year pair
 *
 * @param context
 * @returns {Promise.<{items: Array}>}
 */
function handle (context) {
  debug('start');
  debug('context:', context);
  return albumsProvider
    .fetchAlbumsByQuery(
      Object.assign({}, context, {
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
