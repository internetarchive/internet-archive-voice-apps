const warning = require('debug')('ia:slots:extensions:warning');

const resolvers = require('./resolvers');

/**
 * TODO: should be implemented as actions:
 * extracted from directory structure.
 *
 * But only when we get more than one extension
 *
 * @type {Object}
 */
const extensionTypes = {
  /**
   * gives
   *
   * @param resolverName
   * @returns {*}
   * @private
   */
  __resolvers: (resolverName) => {
    const resolver = resolvers.getByName(resolverName);
    if (!resolver) {
      warning('we missed one resolver here for:', resolverName);
      return null;
    }
    return resolver;
  }
};


/**
 * Just return nothing
 *
 * @param item
 * @returns {*}
 */
const noop = () => {};

/**
 * get slot extension by name
 *
 * all extensions starts with `__`.
 *
 * @param name
 * @returns {*|(function(*): *)}
 */
function getExtensionTypeSet (name) {
  return extensionTypes[name] || noop;
}

module.exports = {
  getExtensionTypeSet,
};
