const debug = require('debug')('ia:actions:in-one-go:debug');
const warning = require('debug')('ia:actions:in-one-go:warning');

function build (intentStrings) {
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
    // TODO:
    // 1. populate slots from arguments
    // 2. launch fulfilment

    return Promise.resolve();
  }

  return {
    handler,
  };
}

module.exports = {
  build,
};
