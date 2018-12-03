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

  if (conv.user.userID) {
    return;
  }

  // put timestamp at the start because
  // firestores sorts collections by it's id
  // so we would sort user's data by date of creation
  conv.user.userID = [Date.now(), uuidv4()].join('-');
};
