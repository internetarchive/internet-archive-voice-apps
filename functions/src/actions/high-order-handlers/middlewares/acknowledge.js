const _ = require('lodash');

const selectors = require('../../../configurator/selectors');
const {debug, warning} = require('../../../utils/logger')('ia:actions:hoh:acknowledge');

/**
 * Midleware
 *
 * substitute speech which is better match slots
 * and especially new values.
 *
 * We can customize source of speeches
 *
 * @returns {Promise}
 */
module.exports = ({path = ['acknowledges']} = {}) => (args) => {
  debug('start');
  const {slots, slotScheme, newValues} = args;
  const newNames = Object.keys(newValues);

  // we get new values
  if (newNames.length === 0) {
    debug(`we don't get any new values`);
    return Promise.resolve(args);
  }

  debug('and get new slots:', newValues);

  const availableTemplates = _.get(slotScheme, path);
  if (!availableTemplates) {
    warning(`we can't find available templates in "${path}"`);
    return Promise.resolve(args);
  }

  const template = selectors.find(availableTemplates, {
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
