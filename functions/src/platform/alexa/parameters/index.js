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
  getParam: (name) => _.get(ctx.event.request.intent.slots,
    [camelCaseToScreamingSnake(name), 'value']
  ),
});
