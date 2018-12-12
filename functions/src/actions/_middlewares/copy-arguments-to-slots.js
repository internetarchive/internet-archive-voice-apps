const util = require('util');

const { debug } = require('../../utils/logger/index')('ia:actions:middleware:copy-arguments-to-slots');

/**
 * Middleware
 * which transfer arguments to slots
 *
 * @param app
 * @param app.newValues
 * @param app.query
 * @param app.slotScheme
 * @returns {Promise.<{app: *, newValues, query: *, slotScheme: *}>}
 */
module.exports = () => args => {
  debug('start');
  let { app, newValues = {}, query, slotScheme } = args;
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
  return Promise.resolve({ ...args, newValues })
};
