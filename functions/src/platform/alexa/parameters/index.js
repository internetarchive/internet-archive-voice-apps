const _ = require('lodash');

const camelCaseToScreamingSnake = require('../../../utils/camel-case-to-screaming-snake');

/**
 * Create params layer
 *
 * @param ctx
 * @returns {{getParam}}
 */
module.exports = (ctx) => ({
  /**
   * Get intent param by name
   *
   * @param name {String}
   * @returns {String}
   */
  getByName: (name) => {
    const slot = ctx.event.request.intent.slots[camelCaseToScreamingSnake(name)] || {};
    const id = _.get(slot, ['resolutions', 'resolutionsPerAuthority', 0, 'values', 0, 'value', 'id']);
    return id || slot.value;
  }
});
