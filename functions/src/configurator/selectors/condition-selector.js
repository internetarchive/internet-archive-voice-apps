const math = require('mathjs');

const {debug, warning} = require('../../utils/logger')('ia:selectors:condition-selector');

/**
 * Choose one which satisfies context.
 * Or get default which doesn't have condition
 *
 * @param options {Array.<Object>}
 * @param context {Object}
 * @returns {string}
 */
function find (options, context) {
  debug('Select option by condition');

  if (!context || typeof context !== 'object') {
    throw new Error('context argument should be defined');
  }

  const option = options
    .filter(({condition}) => condition)
    .find(
      ({condition}) => {
        try {
          return math.eval(condition, context);
        } catch (error) {
          warning(`Get error from Math.js:`, error && error.message);
          return false;
        }
      }
    );

  if (option) {
    debug(`we got valid option ${option.name}`);
    return option;
  }

  debug('we get default slot scheme');

  // default option doesn't have condition
  const def = options.find(({condition}) => !condition);
  if (def) {
    return def;
  }

  warning(`There is no valid options in ${options} with ${context}`);
  return null;
}

module.exports = {
  find,
  support: (options) => options.some(o => o.condition),
};
