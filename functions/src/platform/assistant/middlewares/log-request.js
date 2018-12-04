const util = require('util');

const { debug, info } = require('../../../utils/logger')('ia:log-request');

/**
 * Log Request Middleware
 *
 * @param conv
 */
module.exports = (conv) => {
  debug('\n\n');
  debug(`request body: ${util.inspect(conv.request, { depth: null })}`);
  debug(`request headers:`, conv.headers);
  debug('\n\n');
  info(`start handling action: ${conv.action}, intent: ${conv.intent}`);
  if (conv.user) {
    info(`userId:`, conv.user.storage.userId);
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
