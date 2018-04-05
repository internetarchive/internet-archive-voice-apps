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
    warning(`fail request ${error.config.method.toUpperCase()} ${error.config.url}`, error);
    return Promise.reject(error);
  });
};
