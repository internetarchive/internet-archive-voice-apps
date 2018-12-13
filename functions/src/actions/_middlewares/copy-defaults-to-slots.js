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
  let { app, newValues = {}, slotScheme } = ctx;
  if (slotScheme.defaults) {
    debug(`we have [${Object.keys(slotScheme.defaults)}] to check`);
    newValues = entries(slotScheme.defaults)
      .reduce((newValues, [slotName, value]) => {
        if (value && !query.hasSlot(app, slotName)) {
          query.setSlot(app, slotName, value);
          newValues = Object.assign({}, newValues, { [slotName]: value });
        }
        return newValues;
      }, newValues);
    debug(`and copied ${util.inspect(newValues)} slot(s)`);
  }

  return Promise.resolve({ ...ctx, newValues });
};
