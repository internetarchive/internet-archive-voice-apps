const util = require('util');

const {debug, info} = require('../../../utils/logger')('ia:platform:alexa:log-interceptor');

module.exports = (handlerInput) => {
  info('request type:', handlerInput.requestEnvelope.request.type);
  if (handlerInput.requestEnvelope.request.intent) {
    info('request intent:', handlerInput.requestEnvelope.request.intent.name);
  }

  debug('request:', util.inspect(handlerInput.requestEnvelope, {depth: null}));
};
