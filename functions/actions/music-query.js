const querySlots = require('../state/query');

const slots = {
  'collection': {},
  'creator': {},
  'coverage': {},
  'year': {},
};

/**
 * handle music query action
 * - fill slots of music query
 *
 * @param app
 */
function handler (app) {
  for (let slotName in slots) {
    const value = app.getArgument(slotName);
    querySlots.setSlot(app, slotName, value);
  }
}

module.exports = {
  handler,
};
