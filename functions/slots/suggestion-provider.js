const _ = require('lodash');

/**
 * TODO: should be implemented in the way actions were done:
 * invert dependency - each provider describe which slots it could fill
 */

const nope = () => null;
const providers = _([
  {slots: ['coverage'], provider: nope},
  {slots: ['coverage', 'year'], provider: nope},
  // don't think we need it for the moment
  // because we have fixed recommended artists
  // [['creator'], (app) => {}],
  {slots: ['year'], provider: nope},
]);

/**
 * Get Provider to feed suggestions
 *
 * @param slots
 * @returns {T[keyof T]|undefined|S|T|*}
 */
function getSuggestionProviderForSlots (slots) {
  const item = providers.find(item => _.isEqual(item.slots, slots));
  return item && item.provider;
}

module.exports = {
  getSuggestionProviderForSlots,
  providers,
};
