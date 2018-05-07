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

  let url = mustache.render(
    template,
    Object.assign({}, opts, platformOpts)
  );

  return encodeURI(url);
}

module.exports = {
  preprocess,
};
