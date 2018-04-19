const axios = require('axios');

const {debug} = require('../utils/logger')('ia:performance:axio');

const profiler = {};

/**
 * Use profile axios performance
 */
function use () {
  axios.interceptors.request.use((config) => {
    profiler[config.url] = {
      start: Date.now(),
    };
    return config;
  });

  axios.interceptors.response.use((response) => {
    const config = response.config;
    const delta = Date.now() - profiler[config.url].start;
    debug(`${config.method} ${config.url}, time=${delta} msec`);

    delete profiler[config.url];
    return response;
  });
}

module.exports = {
  use,
};
