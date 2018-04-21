const Alexa = require('alexa-sdk');
// const AWS = require('aws-sdk');

const {debug, info} = require('../../../utils/logger')('ia:platform:alexa:handler');

const ErrorHandler = require('./error-handler');
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
        .addErrorHandlers(ErrorHandler)
        // TODO: get from process.env
        // .withSkillId()
        .create();

      // TODO: we don't need it for session attributes
      // turn on once we will have persistant attributes

      // const region = process.env.AWS_REGION;
      // if (region) {
      //   debug('set AWS region', region);
      //   AWS.config.update({region});
      // }

      // alexa.dynamoDBTableName = 'InternetArchiveSessions';
    }

    return skill.invoke(event, context);
  };
};
