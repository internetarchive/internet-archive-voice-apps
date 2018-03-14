const aliases = require('../../../strings').aliases;
const {debug, warning} = require('../../../utils/logger')('ia:resolver:years-interval');

const contextProxy = require('./high-order-resolvers/context-proxy');

module.exports = contextProxy(({name, value}) => {
  debug(aliases);
  if (!(name in aliases)) {
    warning(`we don't have aliases for "${name}".`);
    return undefined;
  }

  if (!(value in aliases[name])) {
    warning(`we don't have alias for "${value}" in "${name}".`);
  }

  return aliases[name][value];
});
