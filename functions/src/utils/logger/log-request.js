const util = require('util');

const {debug, info} = require('.')('ia:log-request');

/**
 * Log Request
 *
 * @param app
 * @param req
 */
module.exports = (app, req) => {
  debug('\n\n');
  debug(`request body:`, req.body);
  debug(`request headers:`, req.headers);
  debug('\n\n');
  info(`start handling action: ${app.getIntent()}`);
  const user = app.getUser();
  if (user) {
    info(`user id: ${app.getUser().userId}`);
    debug(`user name: ${util.inspect(app.getUser().userName)}`);
    debug(`last seen: ${app.getUser().lastSeen}`);
  } else {
    debug('<unknown user>');
  }
  debug(`surface capabilities: ${app.getSurfaceCapabilities()}`);
  debug(`user's session data:`, app.data);
  debug(`user's persistent data:`, app.userStorage);
  debug('\n\n');
};
