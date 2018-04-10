const askBuilder = require('./ask');

/**
 * Return response interface
 *
 * @param ctx
 * @returns {Object}
 */
module.exports = (ctx) => ({
  ask: askBuilder(ctx),
});
