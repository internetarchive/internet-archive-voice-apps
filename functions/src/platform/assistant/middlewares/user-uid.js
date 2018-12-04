const _ = require('lodash');
const uuidv4 = require('uuid/v4');

/**
 * Generate Unique user id if it wasn't exist yet
 * and create user's storage if we don't have it before
 *
 * @param conv
 */
module.exports = (conv) => {
  if (!conv.user) {
    conv.user = {};
  }

  if (!conv.user.storage) {
    conv.user.storage = {};
  }

  if (!conv.user.storage.userId) {
    // put timestamp at the start because
    // firestores sorts collections by it's id
    // so we would sort user's data by date of creation
    conv.user.storage.userId = [Date.now(), uuidv4()].join('-');
    conv.user.storage.newUser = true;
  } else {
    conv.user.storage.newUser = false;
  }

  if (!conv.user.storage.sessionId || _.isEmpty(conv.data)) {
    conv.user.storage.sessionId = [Date.now(), uuidv4()].join('-');
    conv.user.storage.newSession = true;
  } else {
    conv.user.storage.newSession = false;
  }

  // add mark to not have empty dialogflow session data
  _.set(conv.data, 'updateAt', Date.now());
};
