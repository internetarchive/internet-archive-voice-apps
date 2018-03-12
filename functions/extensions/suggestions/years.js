const _ = require('lodash');

const albumsProvider = require('../../provider/albums');
const {debug, warning} = require('../../utils/logger')('ia:suggestions:years');

const MAX_YEARS = 1000;

/**
 * Fetch year suggestions for the artist
 * TODO: actually it should work for any query set
 *
 * @param context
 */
function handle (context) {
  debug(`handle years suggestions for creator:${context.creatorId}`);
  return albumsProvider
    .fetchAlbumsByQuery(Object.assign({}, context, {
      limit: MAX_YEARS,
      fields: 'year',
      order: 'year',
    }))
    .then(res => {
      if (res.total === 0) {
        warning('it seems we defined very strict requirements for years and got nothing');
      }
      if (res.total >= MAX_YEARS) {
        warning('it seems we have asked years with the broad search scope. We should make it more precise to get a more relevant result.');
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
