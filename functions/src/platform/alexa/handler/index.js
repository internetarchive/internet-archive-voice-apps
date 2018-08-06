const Alexa = require('ask-sdk');
const {DynamoDbPersistenceAdapter} = require('ask-sdk-dynamodb-persistence-adapter');
const AWS = require('aws-sdk');

const {debug} = require('../../../utils/logger')('ia:platform:alexa:handler');

const ErrorHandler = require('./error-handler');
const LogInterceptor = require('./log-interceptor');
const handlersBuilder = require('./handlers-builder');

module.exports = (actions) => {
  let dynamoDbPersistenceAdapter = new DynamoDbPersistenceAdapter({
    createTable: true,
    tableName: process.env.DYNAMO_DB_SESSION_TABLE || 'InternetArchiveSessions',
  });
  const handlers = handlersBuilder(actions);
  let skill;
  debug(`We can handle intents: ${handlers.map(({intent}) => `"${intent}"`).join(', ')}`);

  return function (event, context) {
    if (!skill) {
      debug('lazy building');

      skill = Alexa.SkillBuilders.custom()
        .addRequestHandlers(...handlers)
        .addErrorHandlers(ErrorHandler)
        .addRequestInterceptors(LogInterceptor)
        .withPersistenceAdapter(dynamoDbPersistenceAdapter)
        // TODO: get from process.env
        // .withSkillId()
        .create();

      // TODO: we don't need it for session attributes
      // turn on once we will have persistant attributes

      const region = process.env.AWS_REGION;
      if (region) {
        debug('set AWS region', region);
        AWS.config.update({region});
      }

      // alexa.dynamoDBTableName = 'InternetArchiveSessions';
    }

    return skill.invoke(event, context);
  };
};
