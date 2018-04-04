const Alexa = require('alexa-sdk');

const handlersBuilder = require('./handlers-builder');

module.exports = (actions) => (event, context, callback) => {
  const alexa = Alexa.handler(event, context, callback);

  // TODO: get from process.env
  // alexa.appId
  // alexa.dynamoDB
  alexa.registerHandlers(handlersBuilder(actions));

  try {
    alexa.execute();
  } catch (err) {
    console.error('Caught Error: ' + err);
    alexa.emit(':tell', 'Sorry, I\'m experiencing some technical difficulties at the moment. Please try again later.');
  }
};
