const kebabToCamel = require('../../../utils/kebab-to-camel');

/**
 * Map actions to alexa handlers
 *
 * @param actions {Map}
 * @returns {Object}
 */
module.exports = (actions) => {
  if (!actions) {
    return {};
  }

  return Array
    .from(actions.keys())
    .reduce((acc, name) => {
      return Object.assign({}, acc, {
        [kebabToCamel(name)]: actions.get(name),
      });
    }, {});
};
