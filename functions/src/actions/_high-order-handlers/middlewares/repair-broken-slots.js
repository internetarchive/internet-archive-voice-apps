const {debug, warning} = require('../../../utils/logger')('ia:actions:hoh:repair-broken-slots');

const promptSelector = require('../../../slots/slots-of-template');
const selectors = require('../../../configurator/selectors');

/**
 * Middleware
 *
 * we got broken slots so should find right repair phrase
 *
 * @param brokenSlots
 * @param slotCheme
 * @param speech
 *
 * @returns {Promise}
 */
module.exports = () => (context) => {
  debug('start');
  const {brokenSlots, slotScheme, speech = []} = context;
  const brokenSlotsNames = Object.keys(brokenSlots);

  if (brokenSlotsNames.length === 0) {
    debug(`we don't have any missed slots`);
    return Promise.resolve(context);
  }

  debug('we missed slots:', brokenSlotsNames);
  let repairScheme = promptSelector.getPromptsForSlots(
    slotScheme.prompts,
    brokenSlotsNames
  );

  if (!repairScheme) {
    debug(`we don't have any matched prompts for:`, brokenSlotsNames, 'in:', slotScheme.prompts, 'so we use default one');
    // return Promise.resolve(context);
    repairScheme = slotScheme;
  }

  const repair = repairScheme.repair || slotScheme.repair;

  if (!repair) {
    warning(`we don't have any repair phrase in this slot scheme`, slotScheme);
    return Promise.resolve(context);
  }

  debug('promptScheme.repair.speech', repair.speech);
  let template = selectors.find(
    repair.speech,
    context
  );

  debug('we choice repair phrase:', template);
  if (!template) {
    warning(`can't find repair phrase, should use default`);
    template = repair.speech[0];
  }

  return Promise.resolve(Object.assign({}, context, {
    suggestionsScheme: repairScheme,
    speech: speech.concat(template)
  }));
};
