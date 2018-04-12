const Alexa = require('alexa-sdk');

const {debug, info, error} = require('../../../utils/logger')('ia:platform:alexa:handler');

const handlersBuilder = require('./handlers-builder');

module.exports = (actions) => {
  const handlers = handlersBuilder(actions);
  debug(`We can handle intents: ${Object.keys(handlers).map(name => `"${name}"`).join(', ')}`);
  return (event, context, callback) => {
    const alexa = Alexa.handler(event, context, callback);

    info('request type:', event.request.type);
    if (event.request.intent) {
      info('request intent:', event.request.intent.name);

      // if intent starts with AMAZON we will cut this head
      const parts = event.request.intent.name.split('.');
      if (parts[0] === 'AMAZON') {
        debug('cut AMAZON head from intent');
        event.request.intent.name = parts.slice(1).join('.');
      }
    }

    // TODO: get from process.env
    // alexa.appId
    alexa.dynamoDBTableName = 'InternetArchiveSessions';
    alexa.registerHandlers(handlers);

    try {
      alexa.execute();
    } catch (err) {
      error('Caught Error:', err);
      alexa.emit(':tell', 'Sorry, I\'m experiencing some technical difficulties at the moment. Please try again later.');
    }
  };
};
