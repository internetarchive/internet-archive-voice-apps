const esapceHTML = require('./escape-html');

/**
 * Escape all string data inside of structure
 *
 * @param data
 * @param {array} skipFields - don't escape these fields
 * @returns {*}
 */
module.exports = function escapeStucture (data, {skipFields = []} = {}) {
  if (!data) {
    return data;
  }

  if (typeof data === 'string') {
    return esapceHTML(data);
  }

  if (Array.isArray(data)) {
    return data.map(v => escapeStucture(v));
  }

  if (typeof data === 'object') {
    return Object.entries(data)
      .map(([key, value]) => [key, skipFields.indexOf(key) < 0 ? escapeStucture(value) : value])
      .reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {});
  }

  return data;
};
