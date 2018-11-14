// const persistence = require('./session');
const persistence = require('./user');

/**
 * Return persistence interface
 *
 * @param assistant app
 */
module.exports = (conv) => persistence(conv);
