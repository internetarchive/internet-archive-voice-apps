/**
 * Middleware
 * which transfer arguments to slots
 *
 * @param app
 * @param newValues
 * @param query
 * @param slotsScheme
 * @returns {Promise.<{app: *, newValues, query: *, slotScheme: *}>}
 */
module.exports = function () {
  return function ({app, newValues = {}, query, slotScheme, ...res}) {
    newValues = slotScheme.slots
      .reduce((newValues, slotName) => {
        const value = app.getArgument(slotName);
        if (value) {
          query.setSlot(app, slotName, value);
          newValues = Object.assign({}, newValues, {[slotName]: value});
        }
        return newValues;
      }, newValues);

    return Promise.resolve({app, newValues, query, slotScheme, ...res});
  };
};
