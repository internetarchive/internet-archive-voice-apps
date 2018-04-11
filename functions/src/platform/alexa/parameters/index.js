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
    // try to get params of request 1st
    if (name in ctx.event.request) {
      return ctx.event.request[name];
    }

    const intent = ctx.event.request.intent || {};
    const id = _.get(intent, ['slots', camelCaseToScreamingSnake(name), 'resolutions', 'resolutionsPerAuthority', 0, 'values', 0, 'value', 'id']);
    return id || _.get(intent, ['slots', camelCaseToScreamingSnake(name), 'value']);
  },
});
