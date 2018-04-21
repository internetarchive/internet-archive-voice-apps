const Alexa = require('alexa-sdk');
const AWS = require('aws-sdk');

const {debug, info, error} = require('../../../utils/logger')('ia:platform:alexa:handler');

const handlersBuilder = require('./handlers-builder');

module.exports = (actions) => {
  const handlers = handlersBuilder(actions);
  let skill;
  debug(`We can handle intents: ${Object.keys(handlers).map(name => `"${name}"`).join(', ')}`);

  return (event, context) => {
    info('request type:', event.request.type);
    if (event.request.intent) {
      info('request intent:', event.request.intent.name);
    }

    if (!skill) {
      debug('lazy building');

      skill = Alexa.SkillBuilders.custom()
        .addRequestHandlers(...handlers)
        // .addErrorHandlers(ErrorHandler)
        // TODO: get from process.env
        // .withSkillId()
        .create();

      const region = process.env.AWS_REGION;
      if (region) {
        debug('set AWS region', region);
        AWS.config.update({region});
      }

      // TODO: we don't need it for session attributes
      // turn on once we will have persistant attributes
      // alexa.dynamoDBTableName = 'InternetArchiveSessions';
    }

    try {
      return skill.invoke(event, context);
    } catch (err) {
      error('Caught Error:', err);
      // alexa.emit(':tell', 'Sorry, I\'m experiencing some technical difficulties at the moment. Please try again later.');
    }
  };
};
