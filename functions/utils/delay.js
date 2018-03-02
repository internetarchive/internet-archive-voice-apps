/**
 * Create delayed promise which could be used:
 *
 * lazyAction()
 *   .then(delay(1000))
 *   .then(doSomethingElse)
 *
 * @param msec
 *
 * @returns {Promise}
 */
module.exports = (msec = 0) => new Promise(resolve => {
  setInterval(msec, resolve);
});
