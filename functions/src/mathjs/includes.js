const math = require('mathjs');

const {debug} = require('../utils/logger')('ia:mathjs:equal');

/**
 * Support includes command:
 *
 * includes(array, element)
 *
 */
module.exports = () => {
  debug('support');
  math.import({
    includes: (a, b) => {
      let array;
      if (typeof a.toArray === 'function') {
        array = a.toArray();
      } else {
        array = a;
      }
      return array.indexOf(b) >= 0;
    },
  }, {override: true});
};
