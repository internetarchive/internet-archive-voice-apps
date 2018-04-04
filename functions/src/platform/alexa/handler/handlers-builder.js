const {App} = require('../app');
const {debug} = require('../../../utils/logger')('ia:platform:alexa:handler');

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
    .reduce((acc, name) => {
      const intent = kebabToCamel(name);
      return Object.assign({}, acc, {
        [intent]: function () {
          debug(`begin handle intent "${intent}"`);
          actions.get(name)(new App(this));
          debug(`end handle intent "${intent}"`);
          this.emit(':responseReady');
        },
      });
    }, {});
};
