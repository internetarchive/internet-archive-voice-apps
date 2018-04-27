const _ = require('lodash');
const sinon = require('sinon');

module.exports = ({
  deviceId = 'one-device', error = null, reason = null, response = {}, sessionAttributes = {}, userAttributes = {}, slots = {}
} = {}) => {
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
      getPersistentAttributes: sinon.stub().resolves(userAttributes),
      setPersistentAttributes: sinon.spy(),
      savePersistentAttributes: sinon.stub().resolves(),
    },

    serviceClientFactory: {},
  };

  handlerInput.responseBuilder = {
    speak: sinon.stub().returns(handlerInput.responseBuilder),
    reprompt: sinon.stub().returns(handlerInput.responseBuilder),
    withSimpleCard: sinon.stub().returns(handlerInput.responseBuilder),
    withStandardCard: sinon.stub().returns(handlerInput.responseBuilder),
    withLinkAccountCard: sinon.stub().returns(handlerInput.responseBuilder),
    withAskForPermissionsConsentCard: sinon.stub().returns(handlerInput.responseBuilder),
    addDelegateDirective: sinon.stub().returns(handlerInput.responseBuilder),
    addElicitSlotDirective: sinon.stub().returns(handlerInput.responseBuilder),
    addConfirmSlotDirective: sinon.stub().returns(handlerInput.responseBuilder),
    addConfirmIntentDirective: sinon.stub().returns(handlerInput.responseBuilder),
    addAudioPlayerPlayDirective: sinon.stub().returns(handlerInput.responseBuilder),
    addAudioPlayerStopDirective: sinon.stub().returns(handlerInput.responseBuilder),
    addAudioPlayerClearQueueDirective: sinon.stub().returns(handlerInput.responseBuilder),
    addRenderTemplateDirective: sinon.stub().returns(handlerInput.responseBuilder),
    addHintDirective: sinon.stub().returns(handlerInput.responseBuilder),
    addVideoAppLaunchDirective: sinon.stub().returns(handlerInput.responseBuilder),
    withShouldEndSession: sinon.stub().returns(handlerInput.responseBuilder),
    addDirective: sinon.stub().returns(handlerInput.responseBuilder),
    getResponse: sinon.stub().returns(response),
  };

  _.set(handlerInput, 'requestEnvelope.context.System.device.deviceId', deviceId);

  return handlerInput;
};
