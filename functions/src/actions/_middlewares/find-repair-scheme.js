const promptSelector = require('../../slots/slots-of-template');
const { debug, warning } = require('../../utils/logger/index')('ia:actions:middlewares:find-repair-scheme');

const { requiredParameter } = require('./utils');

/**
 * Middleware
 *
 * we got broken slots so should find right repair phrase
 *
 * so we are getting repair scheme and suggestion scheme
 *
 * @param brokenSlots
 * @param slotScheme
 *
 * @returns {Promise}
 */
module.exports = () => (ctx) => {
  debug('start');

  const { brokenSlots, slotScheme } = ctx;

  requiredParameter(brokenSlots, { name: 'brokenSlots' });
  requiredParameter(slotScheme, { name: 'slotScheme' });

  const brokenSlotsNames = Object.keys(brokenSlots);

  if (brokenSlotsNames.length === 0) {
    // TODO: should be excluded and non-empty brokenSlots should be mandated
    debug(`we don't have any missed slots`);
    return Promise.resolve(ctx);
  }

  debug('we missed slots:', brokenSlotsNames);
  let repairSlotScheme = promptSelector.getPromptsForSlots(
    slotScheme.prompts,
    brokenSlotsNames
  );

  // use parent slot scheme if we don't have specialized
  if (!repairSlotScheme) {
    debug(`we don't have any matched prompts for:`, brokenSlotsNames, 'in:', slotScheme.prompts, 'so we use default one');
    repairSlotScheme = slotScheme;
  }

  // if we don't have repair phrase for specific prompt
  const repairScheme = repairSlotScheme.repair || slotScheme.repair;

  if (!repairScheme) {
    warning(`we don't have any repair phrase in this slot scheme`, slotScheme);
    return Promise.resolve(ctx);
  }

  return Promise.resolve(Object.assign({}, ctx, {
    repairScheme,
    suggestionsScheme: repairSlotScheme,
  }));
};
