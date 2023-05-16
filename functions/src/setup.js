/**
 * Setup application
 */
const axios = require('axios');
const mustache = require('mustache');

const packageJSON = require('../package.json');

const appConfig = require('./config');
const env = require('./config/env');
const errors = require('./errors');
const mathjsExtensions = require('./mathjs');
const axiosProfile = require('./performance/axios');
const { debug, warning } = require('./utils/logger')('ia:axio:interceptions');

/**
 * @private
 *
 * intersect http error and log it
 *
 * @type {{const: *}}
 */
const errorHandler = (error) => {
  const config = error.config;
  if (config) {
    warning(`fail request ${config.method.toUpperCase()} ${config.url}`, error);
  } else {
    warning('fail', error);
  }
  return Promise.reject(new errors.HTTPError(error));
};

module.exports = ({ platform }) => {
  // turn-off escaping in MustacheJS
  mustache.escape = v => v;

  mathjsExtensions.patch();

  const userAgent = mustache.render(
    appConfig.request.userAgent,
    Object.assign({}, packageJSON, { platform })
  );

  // clean interceptors
  axios.interceptors.request.handlers = [];
  axios.interceptors.response.handlers = [];

  axios.interceptors.request.use((config) => {
    config.headers['user-agent'] = userAgent;
    debug(`${config.method.toUpperCase()} ${config.url}`);
    return config;
  }, errorHandler);

  axios.interceptors.response.use(config => config, errorHandler);

  if (env(platform)('performance', 'requests')) {
    axiosProfile.use();
  }
};
