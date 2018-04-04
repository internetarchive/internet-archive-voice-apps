const _ = require('lodash');
const sinon = require('sinon');

module.exports = ({deviceId = 'one-device'} = {}) => {
  const alexa = {
    attributes: {},
    emit: sinon.spy(),
  };
  _.set(alexa, 'event.context.System.device.deviceId', deviceId);
  return alexa;
};
