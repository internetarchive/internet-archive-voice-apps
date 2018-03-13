const loggerBuilder = require('debug');

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
