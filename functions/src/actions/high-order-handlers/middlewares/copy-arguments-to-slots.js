const {debug} = require('../../../utils/logger')('ia:actions:middleware:copy-arguments-to-slots');

/**
 * Middleware
 * which transfer arguments to slots
 *
 * @param app
 * @param newValues
 * @param query
 * @param slotScheme
 * @returns {Promise.<{app: *, newValues, query: *, slotScheme: *}>}
 */
module.exports = () =>
// sadly Google Firebase doesn't support modern Node.js
//   ({app, newValues = {}, query, slotScheme, ...res}) => {
  args => {
    let {app, newValues = {}, query, slotScheme} = args;
    debug('apply copy arguments to slots middleware');
    debug(`we have [${slotScheme.slots}] to check`);
    newValues = slotScheme.slots
      .reduce((newValues, slotName) => {
        const value = app.getArgument(slotName);
        if (value) {
          query.setSlot(app, slotName, value);
          newValues = Object.assign({}, newValues, {[slotName]: value});
        }
        return newValues;
      }, newValues);

    debug(`and copied ${JSON.stringify(newValues)} slot(s)`);
    return Promise.resolve(
      Object.assign({}, args, {newValues})
    );
    // sadly Google Firebase doesn't support modern Node.js
    // return Promise.resolve({app, newValues, query, slotScheme, ...res});
  };
