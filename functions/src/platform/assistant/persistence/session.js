const { debug } = require('../../../utils/logger')('ia:platform:assistant:persistence:session');

/**
 * Session level persistence
 *
 * @param conv
 */
module.exports = (conv) => {
  debug('create');
  debug(conv);
  if (!conv) {
    throw new Error('parameter conv should be defined');
  }

  return {
    /**
     * Drop all session data
     */
    dropAll: () => {
      debug('drop all attributes');
      conv.data = {};
    },

    /**
     * Get data
     *
     * @param name
     * @returns {{}}
     */
    getData: (name) => {
      if (!conv.data) {
        throw new Error('"data" field is missed in conv. We can not get user\'s data');
      }

      return conv.data[name];
    },

    /**
     * Update data
     *
     * It check whether we exceed the limits
     * and revert malformed changes
     *
     * @param name
     * @param value
     *
     * @returns {Boolean} Data was stored
     */
    setData: (name, value) => {
      debug(`set attribute ${name} to`, value);

      if (!conv.data) {
        throw new Error('"data" field is missed in conv. We can not get user\'s data');
      }

      // conv.user.storage = {};
      conv.data[name] = value;
      const size = JSON.stringify({ data: conv.data }).length;
      debug(`size of session data: ${size} bytes`);
      return true;
    },
  };
};
