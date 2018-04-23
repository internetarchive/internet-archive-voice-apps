const util = require('util');

const {debug, info} = require('.')('ia:log-request');

/**
 * Log Request Middleware
 *
 * @param conv
 */
module.exports = (conv) => {
  debug('\n\n');
  debug(`request body:`, conv.request.body);
  debug(`request headers:`, conv.request.headers);
  debug('\n\n');
  info(`start handling action: ${conv.action}, intent: ${conv.intent}`);
  if (conv.user) {
    info(`user.id:`, conv.user.id);
    info(`user.last:`, conv.user.last);
    info(`user.name:`, util.inspect(conv.user.name));
  } else {
    info(`user: <unknown>`);
  }
  debug(`surface capabilities:`, util.inspect(conv.available.surfaces.capabilities.surfaces.map(s => s.capabilities.list)));
  debug(`user's session data:`, conv.user.storage);
  // FIXME::
  debug(`user's persistent data:`, conv.userStorage);
  debug('\n\n');
};
