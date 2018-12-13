/**
 *
 */

const _ = require('lodash');

const defaultRule = require('../../config/slot-values-map');
const { debug } = require('../../utils/logger/index')('ia:actions:middlewares:map-slot-values');

function getReplacement (slotRules, value) {
  if (!slotRules) {
    return value;
  }

  value = value.toLowerCase();
  if (value in slotRules) {
    return slotRules[value];
  }

  return value;
}

/**
 * reduce array value
 *
 * @param slotRules
 * @param originalValue
 * @returns {{valueHasChanged: boolean, newValue: any[]}}
 * @private
 */
function reduceArrayValue (slotRules, originalValue) {
  let valueHasChanged = false;

  const newValue = _.uniq(originalValue.map(v => {
    const newSubValue = getReplacement(slotRules, v);
    if (v !== newSubValue) {
      valueHasChanged = true;
    }
    return getReplacement(slotRules, v);
  }));

  return {
    valueHasChanged,
    newValue,
  };
}

/**
 * reduce string value
 *
 * @param slotRules
 * @param originalValue
 * @returns {{valueHasChanged: boolean, newValue: *}}
 */
function reduceStringValue (slotRules, originalValue) {
  const newValue = getReplacement(slotRules, originalValue);
  return {
    valueHasChanged: newValue !== originalValue,
    newValue,
  };
}

function doNothing () {
  return {
    valueHasChanged: false,
    newValue: undefined,
  };
}

/**
 * pass thought the list of slots and check whether we have special matching
 * for that slot, and update value
 *
 * @param rules
 * @returns {Function}
 */
module.exports = (rules = defaultRule) => ctx => {
  debug('start');
  const newSlots = {};
  let hasChanged = false;
  const { slots } = ctx;
  for (let [slotName, originalValue] of Object.entries(slots)) {
    const slotRules = rules[slotName];

    let reducer = doNothing;
    if (Array.isArray(originalValue)) {
      reducer = reduceArrayValue;
    } else if (typeof originalValue === 'string') {
      reducer = reduceStringValue;
    }

    const { valueHasChanged, newValue } = reducer(slotRules, originalValue);

    if (valueHasChanged) {
      newSlots[slotName] = newValue;
      hasChanged = true;
    }
  }

  if (!hasChanged) {
    return ctx;
  }

  return {
    ...ctx,
    slots: {
      ...slots,
      ...newSlots,
    },
  };
};
