const creator = require('../../provider/creators');

/**
 *
 * @param app
 * @param slots
 * @returns {Promise.<{items: Array}>}
 */
function handle ({ app, slots }) {
  return creator
    .fetchCreatorsBy(app, Object.assign({}, slots, {
      order: 'downloads+desc',
    }));
}

module.exports = {
  slots: ['creator'],
  handle,
};
