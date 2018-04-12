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

    response: {
      audioPlayerPlay: sinon.stub().callsFake(() => alexa.response),
      cardRenderer: sinon.stub().callsFake(() => alexa.response),
      hint: sinon.stub().callsFake(() => alexa.response),
      listen: sinon.spy(),
      speak: sinon.stub().callsFake(() => alexa.response),
    }
  };
  _.set(alexa, 'event.context.System.device.deviceId', deviceId);
  return alexa;
};
