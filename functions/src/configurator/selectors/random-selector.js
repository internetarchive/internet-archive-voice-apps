const _ = require('lodash');

/**
 * Choose one option
 *
 * @param options
 * @param context
 * @returns {*}
 */
function find (options, context) {
  return _.sample(options);
}

module.exports = {
  find,
};
