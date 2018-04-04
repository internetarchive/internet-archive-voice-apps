const {App} = require('../app');

const kebabToCamel = require('../../../utils/kebab-to-camel');

/**
 * Map actions to alexa handlers
 * - alexa intenets should be camel styled and Object type
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
    .reduce((acc, name) => Object.assign({}, acc, {
      [kebabToCamel(name)]: function () {
        actions.get(name)(new App(this));
      },
    }), {});
};
