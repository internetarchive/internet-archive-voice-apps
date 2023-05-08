/**
 * Converts camelCase to SCREAMING_SNAKE_CASE
 *
 * @param value
 * @returns {*}
 */
module.exports = (value) => {
  const upperChars = value.match(/([A-Z])/g);
  if (!upperChars) {
    return value.toUpperCase();
  }

  for (let i = 0, n = upperChars.length; i < n; i++) {
    value = value.replace(new RegExp(upperChars[i]), '_' + upperChars[i].toLowerCase());
  }

  if (value.slice(0, 1) === '_') {
    value = value.slice(1);
  }

  return value.toUpperCase();
};
