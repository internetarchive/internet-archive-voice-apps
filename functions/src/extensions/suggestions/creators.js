const creator = require('../../provider/creators');

/**
 *
 * @param slots
 * @returns {Promise.<{items: Array}>}
 */
function handle (slots) {
  return creator
    .fetchCreatorsBy(Object.assign({}, slots, {
      order: 'downloads+desc',
    }));
}

module.exports = {
  slots: ['creator'],
  handle,
};
