const Alexa = require('ask-sdk');
const { DynamoDbPersistenceAdapter } = require('ask-sdk-dynamodb-persistence-adapter');
const AWS = require('aws-sdk');
const bst = require('bespoken-tools');
const dashbot = require('dashbot');

const pipeline = require('../../../performance/pipeline');
const { debug, warning } = require('../../../utils/logger')('ia:platform:alexa:handler');

const ErrorHandler = require('./error-handler');
const LogInterceptor = require('./log-interceptor');
const handlersBuilder = require('./handlers-builder');

module.exports = (actions) => {
  // TODO: we don't need it for session attributes
  // turn on once we will have persistent attributes
  const region = process.env.AWS_REGION || 'us-west-1';
  debug('set AWS region', region);

  const dynamoDbPersistenceAdapter = new DynamoDbPersistenceAdapter({
    createTable: true,
    dynamoDBClient: new AWS.DynamoDB({ apiVersion: 'latest', region }),
    tableName: process.env.DYNAMO_DB_SESSION_TABLE || 'InternetArchiveSessions',
  });

  const handlers = handlersBuilder(actions);
  debug(`We can handle intents: ${handlers.map(({ intent }) => `"${intent}"`).join(', ')}`);

  let lambda = Alexa.SkillBuilders.custom()
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
    .lambda();

  // wrap all log services

  if (process.env.DASHBOT_KEY) {
    // for the moment doesn't work
    // because of https://github.com/actionably/dashbot/issues/28
    lambda = dashbot(process.env.DASHBOT_KEY).alexa.handler(lambda);
  } else {
    warning('env variable DASHBOT_KEY should be defined to send logs to dashbot');
  }

  if (process.env.BESPOKEN_KEY) {
    // FIXME: bespoken doesn't support ANSI color escape codes yet
    lambda = bst.Logless.capture(process.env.BESPOKEN_KEY, lambda);
  } else {
    warning('env variable BESPOKEN_KEY should be defined to send logs to bespoken');
  }

  return lambda;
};
