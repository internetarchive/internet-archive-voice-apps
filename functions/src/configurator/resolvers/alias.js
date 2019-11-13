const aliases = require('../../strings').aliases;
const { debug, info, warning } = require('../../utils/logger')('ia:resolvers:alias');

const contextProxy = require('./high-order-resolvers/context-proxy');

/**
 * Map values of slots to aliases
 *
 * @type {{handler, requirements}}
 */
module.exports = contextProxy(({ name, value }) => {
  debug('start');
  debug('aliases', aliases);
  debug('name', name);
  debug('value', value);
  if (!(name in aliases)) {
    warning(`we don't have aliases for "${name}".`);
    return undefined;
  }

  if (!(value in aliases[name])) {
    info(`we don't have alias for "${value}" in "${name}".`);
    return value;
  }

  return aliases[name][value];
});
