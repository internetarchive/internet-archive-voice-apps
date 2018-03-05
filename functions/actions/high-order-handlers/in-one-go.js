const debug = require('debug')('ia:actions:in-one-go:debug');
const warning = require('debug')('ia:actions:in-one-go:warning');

const copyArgmentToSlots = require('./slots/copy-arguments-to-slots');

function build (intentStrings, query) {
  debug('start handler', intentStrings.name);

  if (!intentStrings.slots) {
    warning('Missed slots');
  }

  if (!intentStrings.slots) {
    warning('missed fulfilments');
  }

  /**
   *
   * @param app
   * @returns {Promise.<T>}
   */
  function handler (app) {
    debug('start handler', intentStrings.name);
    const slotScheme = intentStrings;
    return Promise
      .resolve({app, intentStrings, slotScheme, query})
      // populate slots from arguments
      .then(copyArgmentToSlots());
    // TODO: launch fulfilment
  }

  return {
    handler,
  };
}

module.exports = {
  build,
};
