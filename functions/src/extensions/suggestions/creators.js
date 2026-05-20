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
    }))
    .then(res => {
      // Deduplicate creators by name to avoid prompts like "The Grateful Dead or The Grateful Dead"
      const seen = new Set();
      const uniqueItems = res.items.filter(item => {
        const creatorName = item.creator;
        if (seen.has(creatorName)) {
          return false;
        }
        seen.add(creatorName);
        return true;
      });
      return Object.assign({}, res, {
        items: uniqueItems
      });
    });
}

module.exports = {
  slots: ['creator'],
  handle,
};
