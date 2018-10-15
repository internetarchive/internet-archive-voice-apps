const {error} = require('../../utils/logger')('ia:resolver:and-other');

const contextProxy = require('./high-order-resolvers/context-proxy');

/**
 * Short list: "one item and other"
 *
 * @type {{handler, requirements}}
 */
module.exports = contextProxy(({value}) => {
  if (!Array.isArray(value)) {
    error('is not implemented yet!');
    return undefined;
  }

  if (value.length <= 1) {
    return value[0];
  }

  return `${value[0]} and other`;
});
