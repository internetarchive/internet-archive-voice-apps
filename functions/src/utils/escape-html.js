var entityMap = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;'
};

/**
 * Escape html string
 *
 * @param {string} value
 * @returns {string}
 */
module.exports = function escapeHtml (value) {
  return String(value).replace(/[&<>"'`=//]/g, function fromEntityMap (s) {
    return entityMap[s];
  });
};
