const mustache = require('mustache');

/**
 * Preprocess endpoint url before make request
 *
 * @param template
 * @param ops {object}
 *
 * @returns {string}
 */
function preprocess (template, ops) {
  return mustache.render(template, ops);
}

module.exports = {
  preprocess,
};
