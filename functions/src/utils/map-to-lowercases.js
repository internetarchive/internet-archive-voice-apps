const _ = require('lodash');

/**
 * convert all values to lower case
 * @param o
 * @return {Object}
 */
module.exports = (o) => _.mapValues(o, v => {
  if (typeof v === 'string') {
    return v.toLowerCase();
  }
  return v;
});
