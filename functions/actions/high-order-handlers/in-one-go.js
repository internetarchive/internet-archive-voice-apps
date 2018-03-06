const debug = require('debug')('ia:actions:in-one-go:debug');
const warning = require('debug')('ia:actions:in-one-go:warning');

const copyArgmentToSlots = require('./slots/copy-arguments-to-slots');
const playbackFulfillment = require('./slots/playback-fulfillment');

/**
 * High-order handler
 * for construction in-on-go intent handler
 *
 * @param intentStrings - strings and configuration of handler
 * @param query - storage for search query data
 * @returns {{handler: handler}}
 */
function build (intentStrings, playlist, query) {
  if (!intentStrings) {
    warning('it seems we have missed intentStrings argument');
  }

  if (!playlist) {
    warning('it seems we have missed playlist argument');
  }

  if (!query) {
    warning('it seems we have missed query argument');
  }

  debug('start handler', intentStrings.name);

  if (!intentStrings.slots) {
    warning('Missed slots');
  }

  if (!intentStrings.slots) {
    warning('missed fulfillments');
  }

  /**
   * handle "in one go" action
   *
   * @param app
   * @returns {Promise.<T>}
   */
  function handler (app) {
    debug('start handler', intentStrings.name);
    const slotScheme = intentStrings;

    // pipe line of actions handling
    return Promise
      .resolve({app, playlist, slotScheme, query})
      .then(copyArgmentToSlots())
      .then(playbackFulfillment());
  }

  return {
    handler,
  };
}

module.exports = {
  build,
};
