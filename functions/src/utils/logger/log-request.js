const {debug, info} = require('.')('ia:log-request');

/**
 * Log Request
 *
 * @param app
 * @param req
 */
module.exports = (app, req) => {
  debug('\n\n');
  debug(`request body: ${JSON.stringify(req.body)}`);
  debug(`request headers: ${JSON.stringify(req.headers)}`);
  debug('\n\n');
  info(`start handling action: ${app.getIntent()}`);
  const user = app.getUser();
  if (user) {
    info(`user id: ${app.getUser().userId}`);
    debug(`user name: ${app.getUser().userName}`);
    debug(`last seen: ${app.getUser().lastSeen}`);
  } else {
    debug('<unknown user>');
  }
  debug(`surface capabilities: ${app.getSurfaceCapabilities()}`);
  debug(`user's session data: ${JSON.stringify(app.data)}`);
  debug(`user's persistent data: ${JSON.stringify(app.userStorage)}`);
  debug('\n\n');
};
