const uuidv4 = require('uuid/v4');

/**
 * Generate Unique user id if it wasn't exist yet
 *
 * @param conv
 */
module.exports = (conv) => {
  if (conv.user && conv.user.userID) {
    return;
  }

  conv.user = {
    userID: [Date.now(), uuidv4()].join('-')
  };
};
