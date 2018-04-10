const humanize = require('../../humanize');

const {error} = require('../../utils/logger')('ia:resolver:short-options');

const contextProxy = require('./high-order-resolvers/context-proxy');

/**
 * Humanize short (maximum 3) list of options
 *
 * @param context
 * @returns {Promise}
 */
module.exports = contextProxy(({value}) => {
  if (!Array.isArray(value)) {
    error('is not implemented yet!');
    return undefined;
  }

  return humanize.list.toFriendlyString(value.slice(0, 3), {ends: ' or '});
});
