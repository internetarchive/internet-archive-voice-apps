const persistence = require('./custom');
// const persistence = require('./session');
// const persistence = require('./user');

/**
 * Return persistence interface
 *
 * - use custom location which would pick by Firestore middleware
 *
 * @param conv
 * @returns {*}
 */
module.exports = (conv) => persistence(['firestore', 'sessionData'])(conv);
