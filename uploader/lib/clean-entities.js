const _ = require('lodash');

function dropBrackets (value) {
  return value.replace(/[\(,\)]/g, '');
}

function cleanEntities (entities) {
  return entities.map(e => _.mapValues(e, v => dropBrackets(v)));
}

module.exports = {
  cleanEntities,
  dropBrackets,
};
