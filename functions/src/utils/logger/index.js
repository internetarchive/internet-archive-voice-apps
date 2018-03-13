const functions = require('firebase-functions');
const _ = require('lodash');
patchDebugScopeEnvVariable();
const loggerBuilder = require('debug');

/**
 * Patch DEBUG environment variable (process.env.DEBUG)
 * before 'debug' module is requiring.
 * Because it uses it to define scope of logging
 */
function patchDebugScopeEnvVariable () {
  let functionsConfig;
  let runOnFunctionFireBaseServer = false;
  try {
    functionsConfig = functions.config();
    runOnFunctionFireBaseServer = true;
    process.env.DEBUG = _.at(
      functionsConfig, 'debugger.scope')[0] || process.env.DEBUG;
  } catch (e) {
    functionsConfig = {debugger: {scope: null}};
  }

  if (runOnFunctionFireBaseServer) {
    // we shouldn't use console
    // but it is trade-off because we can't be sure
    // that process.env will be patched form functions.config correctly
    console.info(`initial process.env:
                ${JSON.stringify(process.env)}`);
    console.info(`initial functions.config():
                ${JSON.stringify(functionsConfig)}`);
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
  if (console.debug) {
    debug.log = console.debug.bind(console);
  }
  const error = loggerBuilder(`${name}:error`);
  if (console.error) {
    error.log = console.error.bind(console);
  }
  const warning = loggerBuilder(`${name}:warning`);
  if (console.warn) {
    warning.log = console.warn.bind(console);
  }

  return {
    debug,
    error,
    warning,
  };
};
