const { debug, timer, warning } = require('../../utils/logger')('ia:selectors:condition-selector');
const util = require('util');

const ALLOWED_FUNCS = {
  equal: (a, b) => a === b,
  includes: (a, b) => {
    const arr = Array.isArray(a) ? a : [a];
    return arr.indexOf(b) >= 0;
  },
};

// Supports: equal(var, "val"), includes(var, "val"), var == "val"
function safeEval (condition, context) {
  try {
    const funcMatch = condition.match(/^(\w+)\((\w+),\s*["']([^"']+)["']\)$/);
    if (funcMatch) {
      const [, funcName, varName, value] = funcMatch;
      const fn = ALLOWED_FUNCS[funcName];
      if (!fn) return false;
      return fn(context[varName], value);
    }

    const eqMatch = condition.match(/^(\w+)\s*==\s*["']([^"']+)["']$/);
    if (eqMatch) {
      const [, varName, value] = eqMatch;
      return context[varName] === value;
    }

    debug('unsupported condition syntax:', condition);
    return false;
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
      const res = safeEval(condition, context);
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
