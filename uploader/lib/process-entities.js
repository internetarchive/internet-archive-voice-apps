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

/**
 * Sort entities by fields
 *
 * @param entities
 */
function sortEntities (entities) {
  return entities.sort((a, b) => {
    const key = Object.keys(a).find(key => a[key] !== b[key]);
    if (key === undefined) {
      return 0;
    }

    if (a[key] < b[key]) {
      return -1;
    }

    if (a[key] > b[key]) {
      return 1;
    }

    return 0;
  });
}

module.exports = {
  clean,
  dropBrackets,
  sortEntities,
};
