const Alexa = require('ask-sdk-core');
// const AWS = require('aws-sdk');

const {debug} = require('../../../utils/logger')('ia:platform:alexa:handler');

const ErrorHandler = require('./error-handler');
const LogInterceptor = require('./log-interceptor');
const handlersBuilder = require('./handlers-builder');

module.exports = (actions) => {
  const handlers = handlersBuilder(actions);
  let skill;
  debug(`We can handle intents: ${handlers.map(({intent}) => `"${intent}"`).join(', ')}`);

  return function (event, context, callback) {
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

    // FIXME:
    // temporal hack because bst doesn't suppor ASK SDK v2 yet
    // https://github.com/bespoken/bst/issues/440
    if (callback) {
      skill.invoke(event, context).then(
        res => callback(null, res),
        err => callback(err)
      );
      return;
    }
    return skill.invoke(event, context);
  };
};
