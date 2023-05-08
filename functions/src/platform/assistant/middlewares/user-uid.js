const { v4: uuidv4 } = require('uuid');

const { debug, info, warning } = require('../../../utils/logger')('ia:platform.assistant.middlewares.user-data');

/**
 * Generate Unique user id if it wasn't exist yet
 * and create user's session if we don't have it before
 *
 * @param conv
 */
module.exports = (conv) => {
  info('start');
  if (!conv.user) {
    conv.user = {};
    warning('we have had conv.user');
  }

  if (!conv.user.storage) {
    conv.user.storage = {};
    warning('we have had conv.user.storage');
  }

  if (!conv.user.storage.userId) {
    // put timestamp at the start because
    // firestores sorts collections by it's id
    // so we would sort user's data by date of creation
    conv.user.storage.userId = [Date.now(), uuidv4()].join('-');
    debug('new user', conv.user.storage.userId);
    conv.user.storage.newUser = true;
  } else {
    debug('returned user', conv.user.storage.userId);
    conv.user.storage.newUser = false;
  }

  if (!conv.user.storage.sessionId || conv.request.conversation.type === 'NEW') {
    conv.user.storage.sessionId = [Date.now(), uuidv4()].join('-');
    conv.user.storage.newSession = true;
    debug('new session', conv.user.storage.sessionId);
  } else {
    conv.user.storage.newSession = false;
    debug('active session', conv.user.storage.sessionId);
  }
};
