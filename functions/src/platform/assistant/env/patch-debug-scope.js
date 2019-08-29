const _ = require('lodash');

/**
 * it seems google firebase function doesn't give access to env variables
 * https://firebase.google.com/docs/functions/config-env
 * so we use its native firebase.config() instead
 *
 * Patch DEBUG environment variable (process.env.DEBUG)
 * before 'debug' module is requiring.
 * Because it uses it to define scope of logging
 */
module.exports = () => {
  const functions = require('firebase-functions');
  process.env.DEBUG = _.at(functions.config(), 'debugger.scope')[0] || process.env.DEBUG;
};
