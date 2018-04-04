const askBuilder = require('./ask');

/**
 * Return response interface
 *
 * @param alexa
 * @returns {Object}
 */
module.exports = (alexa) => ({
  ask: askBuilder(alexa),
});
