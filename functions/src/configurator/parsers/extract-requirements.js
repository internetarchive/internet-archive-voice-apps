const _ = require('lodash');
const mustache = require('mustache');

const resolvers = require('../resolvers');

/**
 * For each template extract required slots
 *
 * - it could be plain:
 * {{coverage}} - good place!' => ['coverage']
 *
 * - hierarchy:
 * Ok! Lets go with {{creator.title}} band!` => ['creator']
 *
 * - with extensible resolvers:
 * 'Ok! Lets go with {{creator.title}} band!' =>
 * ['creatorId']
 *
 * each resolver has list of requirements for example for 'creator':
 * ['creatorId']
 *
 * @param templates
 * @param fields {Array} - list fields which we have
 * @returns {*}
 */
function extractRequrements (templates, fields) {
  return templates && templates
    .map(template => ({
      template,
      requirements: getListOfRequiredSlots(template)
        .reduce(
          (acc, item) => {
            const splitName = item.split('.');
            const firstName = splitName[0];
            if (_.includes(fields, firstName) || !resolvers.has(firstName)) {
              return acc.concat(item);
            }
            const resolver = resolvers.getByName(firstName);
            let requirements = resolver.requirements;
            if (typeof requirements === 'function') {
              requirements = requirements(splitName.slice(1).join('.'));
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
 * Get list of slots which are needed for this/those template(s)
 *
 * @param {Array|string} template
 * @returns {Array}
 */
function getListOfRequiredSlots (template) {
  return [].concat(template)
    .reduce(
      (acc, t) => acc.concat(mustache.parse(t)),
      []
    )
    .filter(token => token[0] === 'name')
    .map(token => token[1]);
}

module.exports = {
  extractRequrements,
  getListOfRequiredSlots,
};
