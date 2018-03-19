const _ = require('lodash');

const extractor = require('../parsers/extract-requirements');
const {debug, warning} = require('../../utils/logger')('ia:selectors:template-selector');

/**
 * Choose template with maximum slots coverage
 *
 * @param options
 * @param context
 * @returns {Promise.<null>}
 */
function find (options, context) {
  debug('sgelect option as template');

  const prioritySlots = context.prioritySlots;
  debug('the priority slots are:', prioritySlots);

  const acknowledgeRequirements = extractor.extractRequrements(options);

  // find the list of acknowledges which match recieved slots
  let validAcknowledges = getMatchedTemplatesExactly(
    acknowledgeRequirements,
    prioritySlots
  );

  if (!validAcknowledges || validAcknowledges.length === 0) {
    validAcknowledges = getMatchedTemplates(
      acknowledgeRequirements,
      prioritySlots
    );

    if (!validAcknowledges || validAcknowledges.length === 0) {
      warning(`there is no valid templates for ${prioritySlots}. Maybe we should write few?`);
      return null;
    }

    debug('we have partly matched template', validAcknowledges);
  } else {
    debug('we have exactly matched template', validAcknowledges);
  }

  // TODO: maybe we should return all matched templates here
  // and choose one on another middleware/selector
  return _.sample(validAcknowledges);
}

/**
 * Get list of templates which match slots
 *
 * @param {Array} templateRequirements
 * @param {Object} slots
 * @returns {Array
 */
function getMatchedTemplates (templateRequirements, slots) {
  return templateRequirements && templateRequirements
    .filter(
      ({requirements}) => requirements.every(r => _.includes(slots, r))
    )
    .map(({template}) => template);
}

/**
 * Get list of templates which match slots exactly
 *
 * @param {Array} templates
 * @param {Object} slots
 * @returns {Array
 */
function getMatchedTemplatesExactly (templateRequirements, slots) {
  const numOfSlots = slots.length;
  return templateRequirements && templateRequirements
    .filter(({requirements}) => {
      const intersection = _.intersection(requirements, slots);
      return intersection.length === requirements.length &&
        intersection.length === numOfSlots;
    })
    .map(({template}) => template);
}

module.exports = {
  find,

  /**
   * we support options which has slots to fill in
   * @param options
   */
  support: (options) => options.some(o => extractor.getListOfRequiredSlots(o).length > 0),

  // we extract those function for test purpose in the first place
  getMatchedTemplates,
  getMatchedTemplatesExactly,
};
