const Alexa = require('alexa-sdk');

const handlers = {
  'LaunchRequest': function () {
    this.emit('HelloWorldIntent');
  },

  'HelloWorldIntent': function () {
    this.emit(':tell', 'Hello World!');
  }
};

module.exports = (actions) => (event, context, callback) => {
  const alexa = Alexa.handler(event, context, callback);
  // TODO: get from process.env
  // alexa.appId
  // alexa.dynamoDB
  alexa.registerHandlers(handlers);
  try {
    alexa.execute();
  } catch (err) {
    console.error('Caught Error: ' + err);
    alexa.emit(':tell', 'Sorry, I\'m experiencing some technical difficulties at the moment. Please try again later.');
  }
};
