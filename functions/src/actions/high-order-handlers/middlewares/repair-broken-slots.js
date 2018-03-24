const {debug, warning} = require('../../../utils/logger')('ia:actions:hoh:substitute-prompt');

// TODO: should be changed to configurator/selectors
const promptSelector = require('../../../slots/slots-of-template');
const selectors = require('../../../configurator/selectors');

module.exports = () => (context) => {
  debug('start');
  const {brokenSlots, slotScheme, speech = []} = context;
  const brokenSlotsNames = Object.keys(brokenSlots);

  if (brokenSlotsNames.length === 0) {
    debug(`we don't have any missed slots`);
    return Promise.resolve(context);
  }

  debug('we missed slots:', brokenSlotsNames);
  const promptScheme = promptSelector.getPromptsForSlots(
    slotScheme.prompts,
    brokenSlotsNames
  );

  if (!promptScheme) {
    warning(`we don't have any matched prompts for:`, brokenSlotsNames, 'in:', slotScheme.prompts);
    return Promise.resolve(context);
  }

  debug('promptScheme.repair.speech', promptScheme.repair.speech);
  // TODO: should tune selectors here
  // maybe we don't have right one
  let template = selectors.find(
    promptScheme.repair.speech,
    context
  );

  debug('we choice repair phrase:', template);
  if (!template) {
    warning(`can't find repair phrase, should use default`);
    template = promptScheme.repair.speech[0];
  }

  return Promise.resolve(Object.assign({}, context, {
    suggestionsScheme: promptScheme,
    speech: speech.concat(template)
  }));
};
