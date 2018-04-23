const functions = require('firebase-functions');
const _ = require('lodash');
patchDebugScopeEnvVariable();
const loggerBuilder = require('debug');

const logEnvVariables = require('./log-env-variables');

logEnvVariables();

// it seems google firebase function doesn't give access to env variables
// https://firebase.google.com/docs/functions/config-env
// so we use its native firebase.config() instead

/**
 * Patch DEBUG environment variable (process.env.DEBUG)
 * before 'debug' module is requiring.
 * Because it uses it to define scope of logging
 */
function patchDebugScopeEnvVariable () {
  let functionsConfig;
  try {
    functionsConfig = functions.config();
    process.env.DEBUG = _.at(
      functionsConfig, 'debugger.scope')[0] || process.env.DEBUG;
  } catch (e) {
    functionsConfig = {debugger: {scope: null}};
  }
}

/**
 * Construct logger for a module
 *
 * @param {String} name - name of the module
 * @returns {{debug: *, error: *, warning: *}}
 */
module.exports = (name) => {
  const debug = loggerBuilder(`${name}:debug`);
  if (console.info) {
    debug.log = console.info.bind(console);
  }
  const error = loggerBuilder(`${name}:error`);
  if (console.error) {
    error.log = console.error.bind(console);
  }
  const info = loggerBuilder(`${name}:info`);
  if (console.info) {
    info.log = console.info.bind(console);
  }
  const warning = loggerBuilder(`${name}:warning`);
  if (console.warn) {
    warning.log = console.warn.bind(console);
  }

  return {
    debug,
    error,
    info,
    warning,
  };
};
