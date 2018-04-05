const persistance = require('./session');

/**
 * Return persistance interface
 *
 * @param assistant app
 */
module.exports = (app) => persistance(app);
