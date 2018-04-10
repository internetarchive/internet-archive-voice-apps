const _ = require('lodash');
const sinon = require('sinon');

/**
 * Create alexa context
 *
 * @param deviceId
 * @param slots
 * @returns {{attributes: {}, emit: *}}
 */
module.exports = ({deviceId = 'one-device', slots = {}} = {}) => {
  const alexa = {
    attributes: {},
    emit: sinon.spy(),
    event: {
      request: {
        intent: {
          slots,
        },
      },
    },
    listen: sinon.spy(),
    response: {
      speak: sinon.stub().callsFake(() => alexa),
      hint: sinon.stub().callsFake(() => alexa),
    }
  };
  _.set(alexa, 'event.context.System.device.deviceId', deviceId);
  return alexa;
};
