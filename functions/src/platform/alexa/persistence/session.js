const _ = require('lodash');
const util = require('util');

const { debug } = require('../../../utils/logger')('ia:platform:alexa:persistence:device-level');

/**
 * Session level persistence.
 * More details here https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/wiki/Skill-Attributes#session-attributes
 *
 * but because of limitations of Alexa session storage
 * we use persistent attributes here
 * https://github.com/internetarchive/internet-archive-google-action/issues/246
 *
 * @param handlerInput
 * @param persistentAttributes
 *
 * @returns {*}
 */
module.exports = (handlerInput, persistentAttributes) => {
  debug('create');
  debug('persistentAttributes:', util.inspect(persistentAttributes, { depth: null }));

  if (!handlerInput) {
    throw new Error('parameter handlerInput should be defined');
  }

  const deviceId = _.get(handlerInput, 'requestEnvelope.context.System.device.deviceId');
  debug('deviceId:', deviceId);

  // TODO: we should clear attributes when we start session

  return {
    /**
     * Drop all session data
     */
    dropAll () {
      debug('drop all attributes');
      _.set(persistentAttributes, [deviceId], {});
      debug(persistentAttributes, util.inspect(persistentAttributes, { depth: null }));
    },

    /**
     * Get data
     *
     * @param name
     * @returns {{}}
     */
    getData (name) {
      if (!name) {
        return persistentAttributes;
      }
      return _.get(persistentAttributes, [deviceId, name]);
    },

    /**
     * Is empty user's storage
     *
     * @returns {boolean}
     */
    isEmpty () {
      return _.isEmpty(_.get(persistentAttributes, deviceId));
    },

    /**
     * Update data
     *
     * @param name
     * @param value
     */
    setData (name, value) {
      debug(`set attribute ${name} to`, util.inspect(value, { depth: null }));
      _.set(persistentAttributes, [deviceId, name], value);
      return true;
    },
  };
};
