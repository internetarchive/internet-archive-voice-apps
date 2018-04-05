/**
 * Setup application
 */
const axios = require('axios');

const env = require('./config/env');
const mathjsExtensions = require('./mathjs');

module.exports = () => {
  mathjsExtensions.patch();

  // patch requests
  axios.interceptors.request.use((config) => {
    config.headers['user-agent'] = env('request', 'user_agent');
    return config;
  }, (error) => {
    return Promise.reject(error);
  });
};
