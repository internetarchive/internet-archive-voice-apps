const persistance = require('./session');

/**
 * Return persistence interface
 *
 * @param assistant app
 */
module.exports = (conv) => persistance(conv);
