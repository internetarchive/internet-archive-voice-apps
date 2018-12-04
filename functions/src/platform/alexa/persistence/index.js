const persistance = require('./session');

/**
 * Return persistence interface
 *
 * @param handlerInput
 */
module.exports = (handlerInput, persistentAttributes) => persistance(handlerInput, persistentAttributes);
