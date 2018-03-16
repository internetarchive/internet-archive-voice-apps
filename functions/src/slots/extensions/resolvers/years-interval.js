const humanize = require('../../../humanize');

const {error} = require('../../../utils/logger')('ia:resolver:years-interval');

const contextProxy = require('./high-order-resolvers/context-proxy');

/**
 * Humanize interval list
 *
 * @param context
 * @returns {Promise}
 */
module.exports = contextProxy(({value}) => {
  if (!Array.isArray(value)) {
    error('is not implemented yet!');
    return undefined;
  }

  if (value.length > 3) {
    return `between ${Math.min.apply(null, value)} and ${Math.max.apply(null, value)}`;
  } else {
    return humanize.list.toFriendlyString(value.slice(0, 3), {ends: ' or '});
  }
});
