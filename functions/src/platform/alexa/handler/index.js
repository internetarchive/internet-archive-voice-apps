const Alexa = require('alexa-sdk');
// const AWS = require('aws-sdk');

const {debug} = require('../../../utils/logger')('ia:platform:alexa:handler');

const ErrorHandler = require('./error-handler');
const LogInterceptor = require('./log-interceptor');
const handlersBuilder = require('./handlers-builder');

module.exports = (actions) => {
  const handlers = handlersBuilder(actions);
  let skill;
  debug(`We can handle intents: ${Object.keys(handlers).map(name => `"${name}"`).join(', ')}`);

  return (event, context) => {
    if (!skill) {
      debug('lazy building');

      skill = Alexa.SkillBuilders.custom()
        .addRequestHandlers(...handlers)
        .addErrorHandlers(ErrorHandler)
        .addRequestInterceptors(LogInterceptor)
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
