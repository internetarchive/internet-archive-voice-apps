const math = require('mathjs');
const util = require('util');

const { debug, timer, warning } = require('../../utils/logger')('ia:selectors:condition-selector');

function safieMathEval (condition, context) {
  try {
    return math.eval(condition, context);
  } catch (error) {
    debug('Get error from Math.js:', error && error.message);
    return false;
  }
}

/**
 * Choose one which satisfies context.
 * Or get default which doesn't have condition
 *
 * @param options {Array.<Object>}
 * @param context {Object}
 * @returns {string}
 */
function find (options, context) {
  debug('select option by condition');

  if (!context || typeof context !== 'object') {
    throw new Error('context argument should be defined');
  }

  const stopFindOptionTimer = timer.start('find option');
  const option = options
    .filter(({ condition }) => condition)
    .find(
      ({ condition }) => {
        const stopMathEvalTimer = timer.start('math.eval');
        const res = safieMathEval(condition, context);
        stopMathEvalTimer();
        return res;
      }
    );

  stopFindOptionTimer();

  if (option) {
    debug(`we got valid option ${option.name}`);
    return option;
  }

  debug('we get default slot scheme');

  // default option doesn't have condition
  const def = options.find(({ condition }) => !condition);
  if (def) {
    return def;
  }

  warning(`There is no valid options in ${util.inspect(options)} with ${util.inspect(context)}`);
  return null;
}

module.exports = {
  find,
  support: (options) => options.some(o => o.condition),
};
