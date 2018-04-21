const _ = require('lodash');
const sinon = require('sinon');

module.exports = ({deviceId = 'one-device', error = null, reason = null, sessionAttributes = {}, slots = {}} = {}) => {
  const handlerInput = {
    requestEnvelope: {
      request: {
        error,

        intent: {
          slots,
        },

        reason,
      },
    },

    context: {},

    attributesManager: {
      getSessionAttributes: sinon.stub().returns(sessionAttributes),
      setSessionAttributes: sinon.spy(),
    },

    responseBuilder: {},

    serviceClientFactory: {},
  };

  _.set(handlerInput, 'requestEnvelope.context.System.device.deviceId', deviceId);

  return handlerInput;
};
