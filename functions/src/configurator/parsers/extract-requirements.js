const mustache = require('mustache');

const extensions = require('../../slots/extensions');

/**
 * For each template extract required slots
 *
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

module.exports = {
  extractRequrements,
  getListOfRequiredSlots,
};
