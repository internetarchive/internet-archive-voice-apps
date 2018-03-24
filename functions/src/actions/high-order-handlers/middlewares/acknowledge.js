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
module.exports = ({prioritySlots = 'newValues', speeches = 'slotScheme.acknowledges'} = {}) => (context) => {
  debug('start');
  const {slots} = context;
  const newValues = _.get(context, prioritySlots) || {};
  const prioritySlotNames = Object.keys(newValues);

  // we get new values
  if (prioritySlotNames.length === 0) {
    debug(`we don't have any priority slots`);
    return Promise.resolve(context);
  }

  debug('priority slots:', newValues);

  const availableTemplates = _.get(context, speeches);
  if (!availableTemplates) {
    warning(`we can't find available templates in "${speeches}"`);
    return Promise.resolve(context);
  }

  const template = selectors.find(availableTemplates, {
    prioritySlots: prioritySlotNames,
    slots,
  });

  if (!template) {
    debug(`we haven't found right acknowledge maybe we should create few for "${prioritySlotNames}"`);
    return Promise.resolve(context);
  }

  debug('we got matched acknowledge', template);

  return Promise.resolve(Object.assign({}, context, {speech: [template]}));
};
