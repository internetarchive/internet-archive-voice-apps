const math = require('mathjs');

/**
 * Choose one which satisfies context.
 * Or get default which doesn't have condition
 *
 * @param options {Array.<Object>}
 * @param context {Object}
 * @returns {string}
 */
function process (options, context) {
  if (!context || typeof context !== 'object') {
    throw new Error('context argument should be defined');
  }

  const option = options
    .filter(({condition}) => condition)
    .find(
      ({condition}) => math.eval(condition, context)
    );

  if (option) {
    return option;
  }

  // default option doesn't have condition
  return options.find(({condition}) => !condition);
}

module.exports = {
  process,
  support: (options) => options.some(o => o.condition),
};
