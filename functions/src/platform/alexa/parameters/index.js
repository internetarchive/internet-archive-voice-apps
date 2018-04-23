const _ = require('lodash');

const camelCaseToScreamingSnake = require('../../../utils/camel-case-to-screaming-snake');

/**
 * Create params layer
 *
 * @param handlerInput
 * @returns {{getParam}}
 */
module.exports = (handlerInput) => ({
  /**
   * Get intent param by name
   *
   * @param name {String}
   * @returns {String}
   */
  getByName: (name) => {
    // try to get params of request 1st
    if (name in handlerInput.requestEnvelope.request) {
      return handlerInput.requestEnvelope.request[name];
    }

    const intent = handlerInput.requestEnvelope.request.intent || {};
    const id = _.get(intent, ['slots', camelCaseToScreamingSnake(name), 'resolutions', 'resolutionsPerAuthority', 0, 'values', 0, 'value', 'name']);
    return id || _.get(intent, ['slots', camelCaseToScreamingSnake(name), 'value']);
  },
});
