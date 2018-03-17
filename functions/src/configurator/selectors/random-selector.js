const _ = require('lodash');

const {debug} = require('../../utils/logger')('ia:selectors:random-selector');

/**
 * Choose one option
 *
 * @param options
 * @param context
 * @returns {*}
 */
function find (options, context) {
  debug('Select option randomly');
  return _.sample(options);
}

module.exports = {
  find,
};
