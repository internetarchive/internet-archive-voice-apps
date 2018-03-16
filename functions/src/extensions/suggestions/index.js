const _ = require('lodash');

/**
 * TODO: should use ./extensions/builder here
 */

const providers = _([
  require('./coverage-year'),
  require('./creators'),
  require('./years'),

  // TODO: should implement suggestions feeders
  // {slots: ['coverage'], handler: () => Promise.resolve({items: []});},
  // {slots: ['year'], handler: () => Promise.resolve({items: []});},
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
