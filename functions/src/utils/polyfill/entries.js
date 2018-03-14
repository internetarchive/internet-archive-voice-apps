const reduce = Function.bind.call(Function.call, Array.prototype.reduce);
const isEnumerable = Function.bind.call(Function.call, Object.prototype.propertyIsEnumerable);
const concat = Function.bind.call(Function.call, Array.prototype.concat);
const keys = Reflect.ownKeys;

/**
 * Polyfill of Object.entries
 *
 * Got from here:
 * https://github.com/tc39/proposal-object-values-entries/blob/master/polyfill.js
 *
 * @param {Object} O
 * @returns {Array}
 */
module.exports = (O) => reduce(
  keys(O),
  (e, k) =>
    concat(e, typeof k === 'string' && isEnumerable(O, k) ? [[k, O[k]]] : []),
  []);
