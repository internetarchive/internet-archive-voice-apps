const entries = require('object.entries');

const escapeHTML = require('./escape-html');

/**
 * Escape all string data inside of structure
 *
 * @param data
 * @param {array} skipFields - don't escape these fields
 * @returns {*}
 */
module.exports = function escapeStructure (data, { skipFields = [] } = {}) {
  if (!data) {
    return data;
  }

  if (typeof data === 'string') {
    return escapeHTML(data);
  }

  if (Array.isArray(data)) {
    return data.map(v => escapeStructure(v));
  }

  if (typeof data === 'object') {
    return entries(data)
      .map(([key, value]) => [key, skipFields.indexOf(key) < 0 ? escapeStructure(value) : value])
      .reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {});
  }

  return data;
};
