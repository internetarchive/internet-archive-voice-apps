const _ = require('lodash');

const camelCaseToScreamingSnake = require('../../../utils/camel-case-to-screaming-snake');

function getSlotValue (slots, slotName) {
  const id = _.get(slots, [slotName, 'resolutions', 'resolutionsPerAuthority', 0, 'values', 0, 'value', 'name']);
  return id || _.get(slots, [slotName, 'value']);
}

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
    const slots = intent.slots;
    if (!slots) {
      return undefined;
    }

    const screamingSnakeName = camelCaseToScreamingSnake(name);
    const res = getSlotValue(slots, screamingSnakeName);
    if (res) {
      return res;
    }

    // try to get synonyms
    const nameRegEx = new RegExp(`${screamingSnakeName}\\.(.+)`);
    const slotNames = Object.keys(slots);
    const synonymSlots = slotNames.filter(
      slotName => nameRegEx.test(slotName)
    );

    if (synonymSlots.length === 0) {
      return undefined;
    }

    return getSlotValue(slots, synonymSlots[0]);
  },
});
