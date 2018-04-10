const _ = require('lodash');

/**
 * TODO: should use ./extensions/builder here
 */

const providers = [
  require('./coverage-year'),
  require('./creators'),
  require('./years'),

  // TODO: should implement suggestions feeders
  // {slots: ['coverage'], handler: () => Promise.resolve({items: []});},
  // {slots: ['year'], handler: () => Promise.resolve({items: []});},
];

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

/**
 * Whether inner is subset of outter
 *
 * @param outter {Array}
 * @param inner {Array}
 */
const isSubset = (outter, inner) => inner.every(s => _.includes(outter, s));

/**
 * Get Provider to feed suggestions (which partly cover slots)
 *
 * @param slots
 * @returns {T[keyof T]|undefined|S|T|*}
 */
function getSuggestionProviderForSubSetOfSlots (slots) {
  const items = providers
    .filter(item => isSubset(slots, item.slots))
    .map(item => ({
      item,
      priority: item.slots.length,
    }))
    .sort((a, b) => b.priority - a.priority);
  if (items.length === 0) {
    return null;
  }
  console.log(items);
  return items[0].item.handle;
}

module.exports = {
  getSuggestionProviderForSlots,
  getSuggestionProviderForSubSetOfSlots,
};
