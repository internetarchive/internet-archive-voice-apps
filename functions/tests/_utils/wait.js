/**
 * resolve promise after awhile
 * @param msec
 * @returns {Promise}
 */
function wait (msec = 0) {
  return new Promise(resolve => setTimeout(resolve, msec));
}

/**
 * create wait promise
 *
 * @param msec
 * @returns {function()}
 */
function willWait (msec = 0) {
  return () => wait(msec);
}

module.exports = {
  wait,
  willWait,
};
