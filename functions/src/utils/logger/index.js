const functions = require('firebase-functions');
const _ = require('lodash');
patchDebugScopeEnvVariable();
const loggerBuilder = require('debug');
const hirestime = require('hirestime');

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
    functionsConfig = { debugger: { scope: null } };
  }
}

/**
 * Wrap logger to specific scope
 *
 * @private
 * @param scope
 * @param consoleFuncName
 * @returns {debug.IDebugger | * | Function}
 */
function wrapLogger (scope, consoleFuncName) {
  const logger = loggerBuilder(scope.join(':'));
  if (console.info) {
    logger.log = (...args) => console[consoleFuncName](...args);
  }
  return logger;
}

/**
 * Construct logger for a module
 *
 * @param {String} name - name of the module
 * @returns {{debug: *, error: *, warning: *}}
 */
module.exports = (name) => {
  const debug = wrapLogger([name, '[debug]'], 'info');
  const error = wrapLogger([name, '[error]'], 'error');
  const info = wrapLogger([name, '[error]'], 'info');
  const warning = wrapLogger([name, '[warning]'], 'warn');
  const performance = wrapLogger([name, '[performance]'], 'info');

  const timerQueue = [];
  return {
    debug,
    error,
    info,
    timer: {
      /**
       * Start measure performance
       *
       * @param id
       */
      start: (id) => {
        const timerIndex = timerQueue.findIndex(i => i.id === id);
        if (timerIndex >= 0) {
          warning(`we called timer.start(${id}) more then once without calling timer.stop()`);
          timerQueue.splice(timerIndex, 1);
          return;
        }

        const elapse = hirestime();
        timerQueue.push({ id, elapse });

        /**
         * Stop last started performance
         */
        return () => {
          const ms = elapse();
          performance(`${ms} ms`, id);
          const timerIndex = timerQueue.findIndex(i => i.id === id);
          timerQueue.splice(timerIndex, 1);
          return ms;
        };
      },
    },
    warning,
  };
};
