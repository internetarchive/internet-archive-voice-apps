const _ = require('lodash');

const { debug, warning } = require('../../../utils/logger')('ia:platform:assistant:persistence:session');

/**
 * We can't use more than 1e4 bytes
 *
 * TODO: so maybe it could have sense to compress data?
 * - https://github.com/mongodb/js-bson write to binary JSON
 * - compress
 * - base64?
 *
 * @type {number}
 */
const maxAvailableSize = 1e4;

/**
 * User level persistence
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
     * Drop all user's data
     */
    dropAll () {
      debug('drop all attributes');
      conv.user.storage = {};
    },

    /**
     * Get data
     *
     * @param name
     * @returns {{}}
     */
    getData (name) {
      if (!conv.user.storage) {
        throw new Error('"data" field is missed in conv. We can not get user\'s data');
      }

      return conv.user.storage[name];
    },

    /**
     * Is empty user's storage
     *
     * @returns {boolean}
     */
    isEmpty () {
      return _.isEmpty(conv.user.storage);
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
    setData (name, value) {
      debug(`set attribute ${name} to`, value);

      if (!conv.user.storage) {
        throw new Error('"data" field is missed in conv. We can not get user\'s data');
      }

      const oldValue = conv.user.storage[name];
      conv.user.storage[name] = value;
      const size = JSON.stringify({ data: conv.user.storage }).length;
      debug(`size of user data: ${size} bytes, ${Math.floor(100 * size / maxAvailableSize)}% of available`);
      if (size > maxAvailableSize) {
        // https://github.com/actions-on-google/actions-on-google-nodejs/issues/134
        warning(`we exceed limitation of platform for user storage (size: ${size} bytes)`);
        conv.user.storage[name] = oldValue;
        return false;
      }
      return true;
    },
  };
};
