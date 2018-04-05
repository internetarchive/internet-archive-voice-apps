/**
 * Setup application
 */
const axios = require('axios');

const env = require('./config/env');
const mathjsExtensions = require('./mathjs');
const {debug, warning} = require('./utils/logger')('ia:axio:interceptions');

module.exports = () => {
  mathjsExtensions.patch();

  // patch requests
  axios.interceptors.request.use((config) => {
    config.headers['user-agent'] = env('request', 'user_agent');
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
};
