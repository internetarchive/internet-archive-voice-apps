/**
 * make object json friendly
 * - strip NaN
 *
 * @param {Object} o
 * @returns {Object}
 */
module.exports = (o) => {
  return JSON.parse(JSON.stringify(o));
};
