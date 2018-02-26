const _ = require('lodash');
const mustache = require('mustache');

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
 * get list of templates which match slots
 *
 * @param {Array} templates
 * @param {Object} slots
 * @returns {Array
 */
function getMatchedTemplates (templates, slots) {
  return templates
    .map(greeting => ({
      template: greeting,
      requirements: getListOfRequiredSlots(greeting)
    }))
    .filter(
      ({requirements}) => requirements.every(r => _.includes(slots, r))
    )
    .map(({template}) => template);
}

module.exports = {
  getListOfRequiredSlots,
  getMatchedTemplates,
};
