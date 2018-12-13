const util = require('util');

const query = require('../../state/query');

const { debug } = require('../../utils/logger/index')('ia:actions:middleware:copy-arguments-to-slots');

/**
 * Middleware
 * which transfer arguments to slots
 *
 * @param ctx
 * @param ctx.newValues
 * @param ctx.slotScheme
 * @returns {Promise.<{app: *, newValues, query: *, slotScheme: *}>}
 */
module.exports = () => ctx => {
  debug('start');
  let { app, newValues = {}, slotScheme } = ctx;
  debug(`we have [${slotScheme.slots}] to check`);
  newValues = slotScheme.slots
    .reduce((newValues, slotName) => {
      let value = app.params.getByName(slotName);
      if (value) {
        query.setSlot(app, slotName, value);
        newValues[slotName] = value;
      }
      return newValues;
    }, { ...newValues });

  debug(`and copied ${util.inspect(newValues)} slot(s)`);
  return Promise.resolve({ ...ctx, newValues });
};
