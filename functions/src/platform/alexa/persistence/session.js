const _ = require('lodash');

const {debug} = require('../../../utils/logger')('ia:platform:alexa:persistance:device-level');

/**
 * Session level persistance.
 * More details here https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/wiki/Skill-Attributes#session-attributes
 *
 * @param handlerInput
 */
module.exports = (handlerInput) => {
  debug('create');

  if (!handlerInput) {
    throw new Error('parameter handlerInput should be defined');
  }

  // const deviceId = handlerInput.requestEnvelope.context.System.device.deviceId;
  // debug('deviceId:', deviceId);

  return {
    /**
     * Get data
     *
     * @param name
     * @returns {{}}
     */
    getData: (name) => {
      // return _.get(handlerInput.attributesManager.getSessionAttributes(), [deviceId, name]);
      return _.get(handlerInput.attributesManager.getSessionAttributes(), name);
    },

    /**
     * Update data
     *
     * @param name
     * @param value
     */
    setData: (name, value) => {
      debug(`set attribute ${name} to`, value);
      handlerInput.attributesManager.setSessionAttributes(
        Object.assign(
          {},
          handlerInput.attributesManager.getSessionAttributes(),
          {[name]: value}
        )
      );
    },
  };
};
