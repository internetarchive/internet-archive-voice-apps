const selectors = require('../../../configurator/selectors');
const {debug} = require('../../../utils/logger')('ia:actions:hoh:substitute-acknowledge');

/**
 * Midleware
 *
 * @param app
 *
 * @returns {Promise}
 */
module.exports = () => (args) => {
  debug('start');
  const {slots, slotScheme, newValues} = args;
  const newNames = Object.keys(newValues);

  // we get new values
  if (newNames.length === 0) {
    debug(`we don't get any new values`);
    return Promise.resolve(args);
  }

  debug('and get new slots:', newValues);

  const template = selectors.find(slotScheme.acknowledges, {
    prioritySlots: newNames,
    slots,
  });

  if (!template) {
    debug(`we haven't found right acknowledge maybe we should create few for "${newNames}"`);
    return Promise.resolve(args);
  }

  debug('we got matched acknowledge', template);

  return Promise.resolve(Object.assign({}, args, {speech: [template]}));
};
