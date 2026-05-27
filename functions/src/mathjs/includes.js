const { debug } = require('../utils/logger')('ia:mathjs:includes');
/**
 * Support includes command:
 *
 * includes(array, element)
 *
 */
module.exports = () => {
  debug('support');
  const includes = (a, b) => {
    let array;
    if (typeof a.toArray === 'function') {
      array = a.toArray();
    } else {
      array = a;
    }
    return array.indexOf(b) >= 0;
  };
  return includes;
};
