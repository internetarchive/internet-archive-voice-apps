const _ = require('lodash');

/**
 * Drop brackets from string
 *
 * @param value
 */
function dropBrackets (value) {
  return value.replace(/[\(,\)]/g, '');
}

/**
 * Clean Entities
 *
 * @param entities
 */
function clean (entities) {
  return entities.map(e => _.mapValues(e, v => dropBrackets(v)));
}

module.exports = {
  clean,
  dropBrackets,
};
