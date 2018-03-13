const humanize = require('../../../humanize');

const contextProxy = require('./high-order-resolvers/context-proxy');

module.exports = {
  /**
   * Humanize short (maximum 3) list of options
   *
   * @param context
   * @returns {Promise}
   */
  handler: contextProxy((value) =>
    humanize.list.toFriendlyString(value.slice(0, 3), {ends: ' or '})
  )
};
