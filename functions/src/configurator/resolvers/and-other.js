const {error} = require('../../utils/logger')('ia:resolver:and-other');

const contextProxy = require('./high-order-resolvers/context-proxy');

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
