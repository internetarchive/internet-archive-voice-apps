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
 * For each template extract required slots
 * - it could be plain:
 * {{coverage}} - good place!' => ['coverage']
 *
 * - hierarchy:
 * Ok! Lets go with {{creator.title}} band!` => ['creator']
 *
 * - with extensible resovlers:
 * 'Ok! Lets go with {{__resolvers.creator.title}} band!' =>
 * ['creatorId']
 *
 * each resolver has list of requirements for example for 'creator':
 * ['creatorId']
 *
 * @param templates
 */
function extractRequrements (templates) {
  return templates && templates
    .map(template => ({
      template,
      requirements: getListOfRequiredSlots(template)
        .reduce(
          (acc, item) => {
            const splitName = item.split('.');
            const extType = extensions.getExtensionTypeFromValue(splitName[0]);
            const extension = extensions.getExtensionTypeSet(extType)(splitName[1]);
            if (!extension) {
              return acc.concat(item);
            }
            let requirements = extension.requirements;
            if (typeof requirements === 'function') {
              requirements = requirements(splitName.slice(2).join('.'));
            }
            return acc.concat(requirements);
          }, []
        )
        // some slots could be described in temples like slotName.field
        // we should consider slotName only and drop field here
        .map(slot => slot.split('.')[0])
    }));
}

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
 * Get list of templates which match slots
 *
 * @param {Array} templateRequirements
 * @param {Object} slots
 * @returns {Array
 */
function getMatchedTemplates (templateRequirements, slots) {
  return templateRequirements && templateRequirements
    .filter(
      ({requirements}) => requirements.every(r => _.includes(slots, r))
    )
    .map(({template}) => template);
}

/**
 * Get list of templates which match slots exactly
 *
 * @param {Array} templates
 * @param {Object} slots
 * @returns {Array
 */
function getMatchedTemplatesExactly (templateRequirements, slots) {
  const numOfSlots = slots.length;
  return templateRequirements && templateRequirements
    .filter(({requirements}) => {
      const intersection = _.intersection(requirements, slots);
      return intersection.length === requirements.length &&
        intersection.length === numOfSlots;
    })
    .map(({template}) => template);
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
  extractRequrements,
  getListOfRequiredExtensions,
  getListOfRequiredSlots,
  getMatchedTemplates,
  getMatchedTemplatesExactly,
  getPromptsForSlots,
  getRequiredExtensionHandlers,
};
