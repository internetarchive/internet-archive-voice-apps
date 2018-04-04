const Alexa = require('alexa-sdk');
const {debug, error} = require('../../../utils/logger')('ia:platform:alexa:handler');

const handlersBuilder = require('./handlers-builder');

module.exports = (actions) => {
  const handlers = handlersBuilder(actions);
  debug(`We can handle intents: ${Object.keys(handlers).map(name => `"${name}"`).join(', ')}`);
  return (event, context, callback) => {
    const alexa = Alexa.handler(event, context, callback);

    // TODO: get from process.env
    // alexa.appId
    // alexa.dynamoDB
    alexa.registerHandlers(handlers);

    try {
      alexa.execute();
    } catch (err) {
      error('Caught Error:', err);
      alexa.emit(':tell', 'Sorry, I\'m experiencing some technical difficulties at the moment. Please try again later.');
    }
  };
};
