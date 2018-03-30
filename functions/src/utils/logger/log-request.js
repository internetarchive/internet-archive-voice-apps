const {debug} = require('.')('ia:log-request');

/**
 * Log Request
 *
 * @param req
 */
module.exports = (req) => {
  debug(`request body: ${JSON.stringify(req.body)}`);
  debug(`request headers: ${JSON.stringify(req.headers)}`);
};
