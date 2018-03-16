const _ = require('lodash');

/**
 * Choose one option
 *
 * @param options
 * @param context
 * @returns {*}
 */
function process (options, context) {
  return _.sample(options);
}

module.exports = {
  process,
};
