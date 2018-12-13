const _ = require('lodash');

const selectors = require('../../configurator/selectors/index');
const { debug, warning } = require('../../utils/logger/index')('ia:actions:middlewares:acknowledge');

/**
 * Middleware
 *
 * substitute speech which is better match slots
 * and especially new values.
 *
 * We can customize source of speeches
 *
 * @returns {Promise}
 */
module.exports = ({ prioritySlots = 'newValues', speeches = 'slotScheme.acknowledges' } = {}) => (ctx) => {
  debug('start');
  const { slots } = ctx;
  const newValues = _.get(ctx, prioritySlots, {});
  const prioritySlotNames = Object.keys(newValues);

  // we get new values
  if (prioritySlotNames.length === 0) {
    debug(`we don't have any priority slots`);
    return Promise.resolve(ctx);
  }

  debug('priority slots:', newValues);

  const availableTemplates = _.get(ctx, speeches);
  if (!availableTemplates) {
    warning(`we can't find available templates in "${speeches}"`);
    return Promise.resolve(ctx);
  }

  const template = selectors.find(availableTemplates, {
    prioritySlots: prioritySlotNames,
    slots,
  });

  if (!template) {
    debug(`we haven't found right acknowledge maybe we should create few for "${prioritySlotNames}"`);
    return Promise.resolve(ctx);
  }

  debug('we got matched acknowledge', template);

  return Promise.resolve({ ...ctx, speech: [template] });
};
