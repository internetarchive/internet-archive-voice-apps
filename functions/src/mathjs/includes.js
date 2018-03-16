const math = require('mathjs');

/**
 * Support includes command:
 *
 * includes(array, element)
 *
 */
module.exports = () => {
  math.import({
    includes: (a, b) => a.toArray().indexOf(b) >= 0,
  }, {override: true});
};
