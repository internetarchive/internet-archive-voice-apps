const {debug} = require('../../../utils/logger')('ia:platform:assistant:persistance:session');

/**
 * Session level persistance
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
     * @param name
     * @param value
     */
    setData: (name, value) => {
      debug(`set attribute ${name} to`, value);

      if (!conv.user.storage) {
        throw new Error('"data" field is missed in conv. We can not get user\'s data');
      }

      conv.user.storage[name] = value;
    },
  };
};
