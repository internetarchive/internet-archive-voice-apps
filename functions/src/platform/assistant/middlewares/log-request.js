const util = require('util');
const uuidv4 = require('uuid/v4');

const {debug, info} = require('../../../utils/logger')('ia:log-request');

/**
 * Log Request Middleware
 *
 * @param conv
 */
module.exports = (conv) => {
  debug('\n\n');
  debug(`request body: ${util.inspect(conv.request, {depth: null})}`);
  debug(`request headers:`, conv.headers);
  debug('\n\n');
  info(`start handling action: ${conv.action}, intent: ${conv.intent}`);
  if (conv.user) {
    let userId;
    // if a value for userID exists in user storage, it's a returning user so we can
    // just read the value and use it. If a value for userId does not exist in user storage,
    // it's a new user, so we need to generate a new ID and save it in user storage.
    if (userId in conv.user.storage) {
      userId = conv.user.storage.userId;
    } else {
      userId = uuidv4();
      conv.user.storage.userId = userId;
    }
    info(`user.id:`, userId);
    info(`user.last:`, conv.user.last);
    info(`user.name:`, util.inspect(conv.user.name));
  } else {
    info(`user: <unknown>`);
  }
  debug(`surface capabilities:`, util.inspect(conv.available.surfaces.capabilities.surfaces.map(s => s.capabilities.list)));
  debug(`user's session data:`, conv.data);
  // FIXME::
  debug(`user's persistent data:`, conv.user.storage);
  debug('\n\n');
};
