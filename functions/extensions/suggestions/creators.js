const creator = require('../../provider/creators');

/**
 *
 * @param slots
 * @returns {Promise.<{items: Array}>}
 */
function handle (slots) {
  return creator
    .fetchCreatorsBy(Object.assign({}, slots, {
      sort: 'downloads+desc',
    }));
}

module.exports = {
  slots: ['creatorId'],
  handle,
};
