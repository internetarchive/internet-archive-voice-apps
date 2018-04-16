const _ = require('lodash');

const {debug} = require('../../../utils/logger')('ia:platform:alexa:persistance:device-level');

/**
 * Session level persistance
 *
 * @param alexa
 */
module.exports = (alexa) => {
  debug('create');

  const deviceId = alexa.event.context.System.device.deviceId;
  debug('deviceId:', deviceId);

  if (!alexa) {
    throw new Error('parameter alexa should be defined');
  }

  return {
    /**
     * Get data
     *
     * @param name
     * @returns {{}}
     */
    getData: (name) => {
      return _.get(alexa.attributes, [deviceId, name]);
    },

    /**
     * Update data
     *
     * @param name
     * @param value
     */
    setData: (name, value) => {
      debug(`set attribute ${name} to`, value);
      _.set(alexa.attributes, [deviceId, name], value);
    },
  };
};
