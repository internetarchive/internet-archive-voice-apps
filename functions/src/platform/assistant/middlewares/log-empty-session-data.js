const _ = require('lodash');

const { debug, warning } = require('../../../utils/logger')('ia:platform.assistant.middlewares.log-empty-session-data');

/**
 * Log when we got empty session data
 * related to issue https://github.com/actions-on-google/actions-on-google-nodejs/issues/256
 *
 * @param conv
 */
module.exports = (conv) => {
  debug('start');

  if (_.isEmpty(conv.data) && _.get(conv, 'request.conversation.type') !== 'NEW') {
    warning('#256 got empty dailogflow session data!');
  }

  // add mark to not have empty dialogflow session data
  _.set(conv.data, 'updateAt', Date.now());
};
