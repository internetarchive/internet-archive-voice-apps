const creator = require('../../provider/creators');

/**
 *
 * @param slots
 * @returns {Promise.<{items: Array}>}
 */
function handle (slots) {
  return creator
    .fetchCreators(Object.assign({}, slots, {
      sort: 'downloads+desc',
    }));
}

module.exports = {
  slots: ['creator'],
  handle,
};
