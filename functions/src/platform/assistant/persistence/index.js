const persistance = require('./session');

/**
 * Return persistance interface
 *
 * @param assistant app
 */
module.exports = (conv) => persistance(conv);
