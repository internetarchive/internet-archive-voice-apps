const _ = require('lodash');

/**
 * TODO: should be implemented in the way actions were done:
 * invert dependency - each provider describe which slots it could fill
 */

// TODO: should implement suggestions feeders
const nope = () => Promise.resolve({items: []});

const providers = _([
  {slots: ['coverage'], handler: nope},
  require('./coverage-year'),
  require('./creators'),
  {slots: ['year'], handler: nope},
]);

/**
 * Get Provider to feed suggestions
 *
 * @param slots
 * @returns {T[keyof T]|undefined|S|T|*}
 */
function getSuggestionProviderForSlots (slots) {
  const item = providers.find(item => _.isEqual(item.slots, slots));
  return item && item.handle;
}

module.exports = {
  getSuggestionProviderForSlots,
};
