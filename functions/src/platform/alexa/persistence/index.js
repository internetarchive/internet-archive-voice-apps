const persistance = require('./session');

/**
 * Return persistance interface
 *
 * @param handlerInput
 */
module.exports = (handlerInput) => persistance(handlerInput);
