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
 * @private
 * @param item
 * @returns {*}
 */
const noop = () => {
};

/**
 * Get extension type from value
 *
 * @param value
 * @returns {null}
 */
function getExtensionTypeFromValue (value) {
  if (value.slice(0, 2) !== '__') {
    return null;
  }
  return value.slice(2);
}

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
  getExtensionTypeFromValue,
  getExtensionTypeSet,
};
