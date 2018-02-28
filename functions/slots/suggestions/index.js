const _ = require('lodash');

const coverageYear = require('./coverage-year');

/**
 * TODO: should be implemented in the way actions were done:
 * invert dependency - each provider describe which slots it could fill
 */

// TODO: should implement suggestions feeders
const nope = () => Promise.resolve({items: []});

const providers = _([
  {slots: ['coverage'], handler: nope},
  coverageYear,
  // don't think we need it for the moment
  // because we have fixed recommended artists
  // [['creator'], (app) => {}],
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
  return item && item.handler;
}

module.exports = {
  getSuggestionProviderForSlots,
};
