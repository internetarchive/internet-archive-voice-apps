const Alexa = require('ask-sdk');
const { DynamoDbPersistenceAdapter } = require('ask-sdk-dynamodb-persistence-adapter');
const AWS = require('aws-sdk');

const pipeline = require('../../../performance/pipeline');
const { debug } = require('../../../utils/logger')('ia:platform:alexa:handler');

const ErrorHandler = require('./error-handler');
const LogInterceptor = require('./log-interceptor');
const handlersBuilder = require('./handlers-builder');

module.exports = (actions) => {
  // TODO: we don't need it for session attributes
  // turn on once we will have persistent attributes
  const region = process.env.AWS_REGION || 'us-west-1';
  debug('set AWS region', region);

  let dynamoDbPersistenceAdapter = new DynamoDbPersistenceAdapter({
    createTable: true,
    dynamoDBClient: new AWS.DynamoDB({ apiVersion: "latest", region }),
    tableName: process.env.DYNAMO_DB_SESSION_TABLE || 'InternetArchiveSessions',
  });

  const handlers = handlersBuilder(actions);
  let skill;
  debug(`We can handle intents: ${handlers.map(({ intent }) => `"${intent}"`).join(', ')}`);

  return function (event, context) {
    if (!skill) {
      debug('lazy building');

      skill = Alexa.SkillBuilders.custom()
        .addRequestHandlers(...handlers)
        .addErrorHandlers(ErrorHandler)
        .addRequestInterceptors(
          () => pipeline.stage(pipeline.PROCESS_REQUEST)
        )
        .addRequestInterceptors(LogInterceptor)
        .addResponseInterceptors(
          () => pipeline.stage(pipeline.IDLE)
        )
        .withPersistenceAdapter(dynamoDbPersistenceAdapter)
        // TODO: get from process.env
        // .withSkillId()
        .create();
    }

    return skill.invoke(event, context);
  };
};
