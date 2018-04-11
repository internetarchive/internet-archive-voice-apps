const _ = require('lodash');
const sinon = require('sinon');

/**
 * Create alexa context
 *
 * @param deviceId
 * @param slots
 * @returns {{attributes: {}, emit: *}}
 */
module.exports = ({deviceId = 'one-device', error = null, reason = null, slots = {}} = {}) => {
  const alexa = {
    attributes: {},

    emit: sinon.spy(),

    event: {
      request: {
        error,

        intent: {
          slots,
        },

        reason,
      },
    },

    listen: sinon.spy(),

    response: {
      audioPlayerPlay: sinon.stub().callsFake(() => alexa),
      cardRenderer: sinon.stub().callsFake(() => alexa),
      speak: sinon.stub().callsFake(() => alexa),
      hint: sinon.stub().callsFake(() => alexa),
    }
  };
  _.set(alexa, 'event.context.System.device.deviceId', deviceId);
  return alexa;
};
