const _ = require('lodash');

const { debug } = require('../../../utils/logger')('ia:platform:assistant:persistence:custom');

/**
 * Custom level persistence
 *
 * @param field {array} specified where we are going to store session data
 */
module.exports = (field) => (conv) => {
  debug('create');
  debug(conv);
  if (!conv) {
    throw new Error('parameter conv should be defined');
  }

  return {
    /**
     * Drop all session data
     */
    dropAll () {
      debug('drop all attributes');
      _.set(conv, field, {});
    },

    /**
     * Get data
     *
     * @param name
     * @returns {{}}
     */
    getData (name) {
      if (!_.has(conv, field)) {
        throw new Error(`"${field}" field is missed in conv. We can not get user's data`);
      }

      return _.get(conv, field.concat(name).join('.'));
    },

    /**
     * Is empty session data
     *
     * @returns {boolean}
     */
    isEmpty () {
      return _.isEmpty(_.get(conv, field));
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

      if (!_.has(conv, field)) {
        throw new Error(`"${field}" field is missed in conv. We can not set user's data`);
      }

      _.set(conv, field.concat(name), value);
      const size = JSON.stringify(_.get(conv, field)).length;
      debug(`size of session data: ${size} bytes`);
      return true;
    },
  };
};
