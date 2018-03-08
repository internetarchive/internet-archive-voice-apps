const debug = require('debug')('ia:actions:in-one-go:debug');
const warning = require('debug')('ia:actions:in-one-go:warning');

const copyArgumentToSlots = require('./middlewares/copy-arguments-to-slots');
const copyDefaultsToSlots = require('./middlewares/copy-defaults-to-slots');
const playbackFulfillment = require('./middlewares/playback-fulfillment');

/**
 * High-order handler
 * for construction in-on-go intent handler
 *
 * @param playlist - storage for playlist chunk
 * @param strings - strings and configuration of handler
 * @param query - storage for search query data
 * @returns {{handler: handler}}
 */
function build ({playlist, strings, query}) {
  debug(`build handler "${strings.name}"`);

  if (!strings.slots) {
    warning('Missed slots');
  }

  if (!strings.slots) {
    warning('missed fulfillments');
  }

  /**
   * handle "in one go" action
   *
   * @param app
   * @returns {Promise.<T>}
   */
  function handler (app) {
    debug(`start handler "${strings.name}"`);
    const slotScheme = strings;

    // pipeline of actions handling
    return Promise
      .resolve({app, slotScheme, playlist, query})
      .then(copyArgumentToSlots())
      .then(copyDefaultsToSlots())
      .then(playbackFulfillment());
  }

  return {
    handler,
  };
}

module.exports = {
  build,
};
