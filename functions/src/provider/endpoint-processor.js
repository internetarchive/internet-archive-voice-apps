const _ = require('lodash');
const mustache = require('mustache');

const config = require('../config');

/**
 * Preprocess endpoint url before make request
 *
 * @param template {string} url template
 * @param app
 * @param opts {object}
 * @returns {string}
 */
function preprocess (template, app, opts) {
  const platformOpts = _.get(
    config, ['platforms', app.platform, 'endpoint']
  );

  return mustache.render(
    template,
    Object.assign({}, opts, platformOpts)
  );
}

module.exports = {
  preprocess,
};
