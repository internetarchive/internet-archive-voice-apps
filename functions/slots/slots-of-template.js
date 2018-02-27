const warning = require('debug')('ia:slots-template');

const _ = require('lodash');
const mustache = require('mustache');

const resolvers = require('./resolvers');

/**
 * TODO: should be implemented as actions:
 * extracted from directory structure.
 *
 * But only when we get more than one extension
 *
 * @type {Object}
 */
const extensions = {
  __resolvers: (name) => {
    const resolverName = name.split('.')[1];
    const resolver = resolvers.getByName(resolverName);
    if (!resolver) {
      warning('we missed one resolver here for:', resolverName);
      return name;
    }
    return resolver.requirements;
  }
};

/**
 * @param item
 * @returns {*}
 */
const identity = item => item;

/**
 * get slot extension by name
 *
 * all extensions starts with `__`.
 *
 * @param name
 * @returns {*|(function(*): *)}
 */
function getExtension (name) {
  const extension = extensions[name];
  return extension || identity;
}

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
  return templates
    .map(greeting => ({
      template: greeting,
      requirements: getListOfRequiredSlots(greeting)
        .reduce((acc, item) => {
          const beforeDot = item.split('.')[0];
          return acc.concat(
            getExtension(beforeDot)(item)
          );
        }, [])
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
 * Get list of templates which match slots
 *
 * @param {Array} templateRequirements
 * @param {Object} slots
 * @returns {Array
 */
function getMatchedTemplates (templateRequirements, slots) {
  return templateRequirements
    .filter(
      ({requirements}) => requirements.every(r => _.includes(slots, r))
    )
    .map(({template}) => template);
}

/**
 * Get list of templates which match slots
 *
 * @param {Array} templates
 * @param {Object} slots
 * @returns {Array
 */
function getMatchedTemplatesExactly (templateRequirements, slots) {
  const numOfSlots = slots.length;
  return templateRequirements
    .filter(
      ({requirements}) => _.intersection(requirements, slots).length === numOfSlots
    )
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
      priority: _.intersection(p.requirements, slots).length / maximumIntersection,
      p,
    }))
    .sort((a, b) => b.priority - a.priority)
    .map(({p}) => p)[0];
}

module.exports = {
  extractRequrements,
  getListOfRequiredSlots,
  getMatchedTemplates,
  getMatchedTemplatesExactly,
  getPromptsForSlots,
};
