const humanize = require('../../../humanize');

const contextProxy = require('./high-order-resolvers/context-proxy');

module.exports = {
  /**
   * Humanize interval list
   *
   * @param context
   * @returns {Promise}
   */
  handler: contextProxy((value) => {
    if (value.length > 3) {
      return `between ${Math.min.apply(null, value)} and ${Math.max.apply(null, value)}`;
    } else {
      return humanize.list.toFriendlyString(value.slice(0, 3), {ends: ' or '});
    }
  })
};
