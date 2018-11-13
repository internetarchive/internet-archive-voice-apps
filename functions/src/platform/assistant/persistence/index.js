const persistence = require('./session');

/**
 * Return persistence interface
 *
 * @param assistant app
 */
module.exports = (conv) => persistence(conv);
