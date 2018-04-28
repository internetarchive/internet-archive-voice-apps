const math = require('mathjs');

const {debug} = require('../utils/logger')('ia:mathjs:equal');

/**
 * Support equal command:
 *
 * equal("abc", "abc")
 *
 */
module.exports = () => {
  debug('support');
  math.import({
    equal: (a, b) => a === b,
  }, {override: true});
};
