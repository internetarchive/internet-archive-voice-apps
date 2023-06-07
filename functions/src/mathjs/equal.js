const { debug } = require('../utils/logger')('ia:mathjs:equal');
/**
 * Support equal command:
 *
 * equal("abc", "abc")
 *
 */
module.exports = () => {
  debug('support');
  // Define the equal function
  const equal = (a, b) => a === b;
  // Export the equal function
  return equal;
};
