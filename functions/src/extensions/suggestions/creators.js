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
      order: 'best',
    }));
}

module.exports = {
  slots: ['creator'],
  handle,
};
