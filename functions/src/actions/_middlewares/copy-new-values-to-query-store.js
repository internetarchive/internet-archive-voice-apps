const query = require('../../state/query');

const { debug } = require('../../utils/logger/index')('ia:actions:middleware:copy-new-values-to-query-store');

/**
 * Middleware
 *
 * Put all received values to slots
 * and return list of new values
 *
 * @returns {function(*): *}
 */
module.exports = () => ctx => {
  debug('start');
  const { app, newValues } = ctx;
  for (const [slotName, slotValue] of Object.entries(newValues)) {
    query.setSlot(app, slotName, slotValue);
  }
  return ctx;
};
