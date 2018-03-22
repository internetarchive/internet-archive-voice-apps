const _ = require('lodash');
const {debug, warning} = require('../../../utils/logger')('ia:actions:hoh:substitute-prompt');

// TODO: should be changed to configurator/selectors
const selectors = require('../../../slots/slots-of-template');

/**
 * Midleware
 * substitute prompt
 *
 * @param slots {Object}
 * @param slotScheme
 * @param speech {Array}
 *
 * @returns {Promise}
 */
module.exports = () => (args) => {
  debug('start');
  const {slots, slotScheme, speech = []} = args;
  const missedSlots = slotScheme.slots
    .filter(slotName => !(slotName in slots));

  if (missedSlots.length === 0) {
    debug(`we don't have any missed slots`);
    return Promise.resolve(args);
  }

  debug('we missed slots:', missedSlots);
  const promptScheme = selectors.getPromptsForSlots(
    slotScheme.prompts,
    missedSlots
  );

  if (!promptScheme) {
    warning(`we don't have any matched prompts for:`, missedSlots, 'in:', slotScheme.prompts);
    return Promise.resolve(args);
  }

  const template = _.sample(promptScheme.speech);
  debug('we randomly choice prompt:', template);

  return Promise.resolve(Object.assign({}, args, {
    suggestionsScheme: promptScheme,
    speech: speech.concat(template)
  }));
};
