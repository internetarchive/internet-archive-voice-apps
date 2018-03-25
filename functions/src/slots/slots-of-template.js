/**
 * Here are toolkit for parsing templates and extract information about:
 * - matched prompts
 *
 */

const _ = require('lodash');

/**
 * Get prompts which match covers 1st slot
 * and has the maximum intersection with other slots
 *
 * @param {Array} prompts
 * @param {Array} slots
 */
function getPromptsForSlots (prompts, slots) {
  if (!prompts) {
    return null;
  }
  const criticalSlot = slots[0];
  const maximumIntersection = slots.length;
  return prompts
    .filter(p => _.includes(p.confirm, criticalSlot))
    .map(p => ({
      priority: _.intersection(p.confirm, slots).length / (p.confirm.length + maximumIntersection),
      p,
    }))
    .sort((a, b) => b.priority - a.priority)
    .map(({p}) => p)[0];
}

module.exports = {
  getPromptsForSlots,
};
