const util = require('util');

const query = require('../../state/query');
const { debug } = require('../../utils/logger/index')('ia:actions:middleware:copy-defaults-to-slots');
const entries = require('../../utils/polyfill/entries');

/**
 * Middleware
 * which transfer defaults to slots
 *
 * @param app
 * @param newValues
 * @param query
 * @param slotScheme
 * @returns {Promise.<{app: *, newValues, query: *, slotScheme: *}>}
 */
module.exports = () => ctx => {
  debug('start');
  let { app, newValues = {}, slots = {}, slotScheme } = ctx;
  debug('slotScheme.defaults', slotScheme);
  if (slotScheme.defaults) {
    slots = { ...slots };
    debug(`we have [${Object.keys(slotScheme.defaults)}] to check`);
    newValues = entries(slotScheme.defaults)
      .reduce((newValues, [slotName, value]) => {
        if (value && !query.hasSlot(app, slotName)) {
          if (value.skip) {
            query.skipSlot(app, slotName);
          } else {
            query.setSlot(app, slotName, value);
          }
          slots[slotName] = value;
          newValues[slotName] = value;
        }
        return newValues;
      }, { ...newValues });
    debug(`and copied ${util.inspect(newValues)} slot(s)`);
  }

  return Promise.resolve({ ...ctx, slots, newValues });
};
