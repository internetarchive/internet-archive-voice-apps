const { debug, timer, warning } = require('../../utils/logger')('ia:selectors:condition-selector');
const equal = require('../../mathjs/equal');
const includes = require('../../mathjs/includes');
const Parser = require('expr-eval').Parser;
const parser = new Parser();
const util = require('util');

parser.functions.equal = equal();
parser.functions.includes = includes();

function safieEval (condition, context) {
  try {
    return parser.evaluate(condition, context);
  } catch (error) {
    debug('Get error from eval:', error && error.message);
    return false;
  }
}

/**
 * Choose one option that satisfies the context or get the default option that doesn't have a condition.
 *
 * @param options {Array.<Object>}
 * @param context {Object}
 * @returns {Object|null}
 */
function find (options, context) {
  debug('select option by condition');

  if (!context || typeof context !== 'object') {
    throw new Error('context argument should be defined');
  }

  const stopFindOptionTimer = timer.start('find option');
  const option = options
    .filter(({ condition }) => condition)
    .find(({ condition }) => {
      const stopEvalTimer = timer.start('eval');
      const res = safieEval(condition, context);
      stopEvalTimer();
      return res;
    });

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
