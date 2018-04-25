const {debug, warning} = require('../../../utils/logger')('ia:platform:assistant:persistance:session');

/**
 * User level persistance
 *
 * @param conv
 */
module.exports = (conv) => {
  debug('create');

  if (!conv) {
    throw new Error('parameter conv should be defined');
  }

  return {
    /**
     * Get data
     *
     * @param name
     * @returns {{}}
     */
    getData: (name) => {
      if (!conv.user.storage) {
        throw new Error('"data" field is missed in conv. We can not get user\'s data');
      }

      return conv.user.storage[name];
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

      if (!conv.user.storage) {
        throw new Error('"data" field is missed in conv. We can not get user\'s data');
      }

      const oldValue = conv.user.storage[name];
      conv.user.storage[name] = value;
      const size = JSON.stringify({ data: conv.user.storage }).length;
      debug(`size of user data: ${size} bytes`);
      if (size > 1e4) {
        warning(`we exceed limitation of platform for user storage (size: ${size} bytes)`);
        conv.user.storage[name] = oldValue;
        return false;
      }
      return true;
    },
  };
};
