/**
 * Return group and param to env variable name
 *
 * @param group {String}
 * @param prop {String}
 * @returns {String}
 */
module.exports = (group, prop) =>
  [group, prop]
    .map(i => i.toUpperCase())
    .join('_');
