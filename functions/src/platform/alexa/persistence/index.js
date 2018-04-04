const persistance = require('./device-level');

/**
 * Return persistance interface
 *
 * @param alexa
 */
module.exports = (alexa) => persistance(alexa);
