/**
 * Setup application
 */
const axios = require('axios');
const mustache = require('mustache');

const packageJSON = require('../package.json');

const appConfig = require('./config');
const env = require('./config/env');
const mathjsExtensions = require('./mathjs');
const {debug, warning} = require('./utils/logger')('ia:axio:interceptions');

const axiosProfile = require('./performance/axios');

module.exports = ({platform}) => {
  // turn-off escaping in MustacheJS
  mustache.escape = v => v;

  mathjsExtensions.patch();

  const userAgent = mustache.render(
    appConfig.request.userAgent,
    Object.assign({}, packageJSON, {platform})
  );

  // patch requests
  axios.interceptors.request.handlers = [];
  axios.interceptors.response.handlers = [];

  axios.interceptors.request.use((config) => {
    config.headers['user-agent'] = userAgent;
    debug(`${config.method.toUpperCase()} ${config.url}`);
    return config;
  }, (error) => {
    const config = error.config;
    if (config) {
      warning(`fail request ${config.method.toUpperCase()} ${config.url}`, error);
    } else {
      warning(`fail`, error);
    }
    return Promise.reject(error);
  });

  if (env(platform)('performance', 'requests')) {
    axiosProfile.use();
  }
};
