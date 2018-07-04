const _ = require('lodash');
const {debug} = require('../utils/logger')('ia:actions:wayback-machine');

/**
 * Traverse a given object
 *
 * @param {Object} obj
 */
module.exports = function (obj) {
  let results = [];
  function traverse (obj) {
    _.forOwn(obj, (val, key) => {
      if (_.isArray(val)) {
        val.forEach(el => {
          traverse(el);
        });
      } else if (_.isObject(val)) {
        traverse(val);
      } else {
        results.push(val);
      }
    });
  }
  traverse(obj);
  let count = 0;
  while (results.length !== 0) {
    count += results.pop();
  }
  debug('final count inside traverse = ' + count);
  return count;
};
