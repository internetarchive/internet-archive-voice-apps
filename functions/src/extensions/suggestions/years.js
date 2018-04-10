const _ = require('lodash');

const albumsProvider = require('../../provider/albums');
const {debug, warning} = require('../../utils/logger')('ia:suggestions:years');

const MAX_ITEMS = 20000;

/**
 * Fetch year suggestions for the artist
 * TODO: actually it should work for any query set
 *
 * @param context
 * @returns {Promise.<{items: Array}>}
 */
function handle (context) {
  debug(`handle years suggestions for creator:${context.creatorId}`);
  return albumsProvider
    .fetchAlbumsByQuery(Object.assign({}, context, {
      limit: MAX_ITEMS,
      fields: 'year',
      order: 'year',
    }))
    .then(res => {
      if (res.total === 0) {
        warning('it seems we defined very strict requirements for years and got nothing');
      }
      if (res.total >= MAX_ITEMS) {
        warning(`We got ${MAX_ITEMS} from ${res.total}. it seems we have asked years with the broad search scope. We should make it more precise to get a more relevant result.`);
        // TODO: we should highlight uncertanly in the answer
      }

      return Object.assign({}, res, {
        items: _.uniq(res.items.map(i => i.year))
      });
    });
}

module.exports = {
  handle,
  slots: ['year'],
};
