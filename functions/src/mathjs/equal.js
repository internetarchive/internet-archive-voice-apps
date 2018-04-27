const math = require('mathjs');

/**
 * Support equal command:
 *
 */
math.import({
  equal: function (a, b) { return a === b; }
}, {override: true});
