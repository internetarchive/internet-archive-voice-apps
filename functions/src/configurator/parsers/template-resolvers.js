const {debug, warning} = require('../../utils/logger')('ia:slots');

const resolvers = require('../resolvers');

const extractor = require('./extract-requirements');

/**
 * Method name which processes context to fill slot
 *
 * @type {string}
 */
const METHOD_NAME = 'handler';

/**
 * Get list of requested resolvers. the format:
 *
 * - resolver handler - function which gets context and return Promise
 * - resolver name
 *
 * @param template {String} - target template
 * @param haveSlots {Array<strings>} - list of filled slots
 * @returns {Array<Promise>}
 */
function getTemplateResolvers (template, haveSlots = []) {
  debug(`search for resolvers for "${template}" with filled "${haveSlots}"`);
  return getTopLevelSlots(template)
    .filter(name => haveSlots.indexOf(name) < 0)
    .map(name => {
      const resolver = resolvers.getByName(name);
      if (!resolver) {
        warning(`we don't have resolver for ${name}`);
        return null;
      }
      if (!resolver[METHOD_NAME]) {
        warning(`resolver ${name} doesn't have ${METHOD_NAME} method to process context to a slot`);
        return null;
      }

      return {
        handler: resolver[METHOD_NAME],
        name,
      };
    })
    .filter(res => res);
}

/**
 * Get list of top level slots which we would need in the template
 *
 * @private
 * @param template
 * @returns {Array}
 */
function getTopLevelSlots (template) {
  return extractor.getListOfRequiredSlots(template)
    .map(slotFullName => {
      const fullPath = slotFullName.split('.');
      return fullPath[0];
    })
    .filter(name => name);
}

module.exports = {
  getTemplateResolvers,
  getTopLevelSlots,
};
