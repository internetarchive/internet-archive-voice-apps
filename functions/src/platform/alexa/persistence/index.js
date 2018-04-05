const persistance = require('./session');

/**
 * Return persistance interface
 *
 * @param alexa
 */
module.exports = (alexa) => persistance(alexa);
