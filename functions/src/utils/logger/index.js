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
  const performance = loggerBuilder(`${name}:performance`);
  if (console.info) {
    performance.log = console.info.bind(console);
  }

  const timerQueue = [];
  return {
    debug,
    error,
    info,
    timer: {
      /**
       * Start meature performance
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
        timerQueue.push({id, elapse: hirestime()});
      },

      /**
       * Stop last started performance
       */
      stop: () => {
        if (timerQueue.length === 0) {
          warning(`there is no timer left`);
          return;
        }
        const {id, elapse} = timerQueue.pop();
        performance(`${elapse()}ms`, id);
      },
    },
    warning,
  };
};
