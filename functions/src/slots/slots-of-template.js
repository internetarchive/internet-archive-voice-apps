/**
 * Here are toolkit for parsing templates and extract information about:
 * - available slots
 * - and refered extensions (in particular __resolver)
 * - searching and matching from the list of templates
 *
 */

const _ = require('lodash');
const mustache = require('mustache');

const {debug, warning} = require('../utils/logger')('ia:slots');

const extensions = require('./extensions');

/**
 * Get list of slots which need for this template
 *
 * @param {string} template
 * @returns {Array}
 */
function getListOfRequiredSlots (template) {
  return mustache
    .parse(template)
    .filter(token => token[0] === 'name')
    .map(token => token[1]);
}

/**
 * Get list of extension which we would need in the template
 *
 * @param template
 * @returns {Array}
 */
function getListOfRequiredExtensions (template) {
  return getListOfRequiredSlots(template)
    .map(name => {
      const fullPath = name.split('.');
      return {
        extType: extensions.getExtensionTypeFromValue(fullPath[0]),
        name: fullPath[1],
      };
    })
    .filter(({extType, name}) => extType && name);
}

/**
 * Get prompts which match covers 1st slot
 * and has the maximum intersection with other slots
 *
 * @param {Array} prompts
 * @param {Array} slots
 */
function getPromptsForSlots (prompts, slots) {
  const criticalSlot = slots[0];
  const maximumIntersection = slots.length;
  return prompts
    .filter(p => _.includes(p.requirements, criticalSlot))
    .map(p => ({
      priority: _.intersection(p.requirements, slots).length / (p.requirements.length + maximumIntersection),
      p,
    }))
    .sort((a, b) => b.priority - a.priority)
    .map(({p}) => p)[0];
}

/**
 * Returns list of required extensions in the format:
 *
 * - extension handler - function which gets context and return Promise
 * - extension name
 * - extension type
 *
 * @param template
 * @returns {Array}
 */
function getRequiredExtensionHandlers (template) {
  debug(`lets search for extensions for "${template}"`);
  return getListOfRequiredExtensions(template)
    .map(({extType, name}) => {
      const extension = extensions.getExtensionTypeSet(extType)(name);
      debug(`we've found extension "${extType}/${name}"`);
      if (!extension) {
        warning(`but we don't have handler for it`);
      } else if (!extension.handler) {
        warning(`but ${extType}/${name} doesn't have handler() method`);
      }
      return {
        handler: extension && extension.handler,
        extType,
        name
      };
    })
    .filter(({handler}) => handler);
}

module.exports = {
  getListOfRequiredExtensions,
  getListOfRequiredSlots,
  getPromptsForSlots,
  getRequiredExtensionHandlers,
};
