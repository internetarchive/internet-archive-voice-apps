const Alexa = require('alexa-sdk');

const {App} = require('../app');

const handlersBuilder = require('./handlers-builder');

const handlers = {
  'LaunchRequest': function () {
    this.emit('HelloWorldIntent');
  },

  'HelloWorldIntent': function () {
    const app = new App(this);
    app.response.ask({speech: 'Hello World 2!'});
  }
};

module.exports = (actions) => (event, context, callback) => {
  const alexa = Alexa.handler(event, context, callback);
  // TODO: get from process.env
  // alexa.appId
  // alexa.dynamoDB
  alexa.registerHandlers(handlers, handlersBuilder(actions));

  try {
    alexa.execute();
  } catch (err) {
    console.error('Caught Error: ' + err);
    alexa.emit(':tell', 'Sorry, I\'m experiencing some technical difficulties at the moment. Please try again later.');
  }
};
