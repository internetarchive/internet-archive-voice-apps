const esapceHTML = require('./escape-html');

/**
 * Escape all string data inside of structure
 *
 * @param data
 * @returns {*}
 */
module.exports = function escapeStucture (data) {
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
      .map(([key, value]) => [key, escapeStucture(value)])
      .reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {});
  }

  return data;
};
