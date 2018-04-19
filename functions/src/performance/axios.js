const axios = require('axios');

const {debug} = require('../utils/logger')('ia:performance:axio');

/**
 * Use profile axios performance
 */
function use () {
  debug('use');
  axios.interceptors.request.use((config) => {
    config.requestTimestamp = Date.now();
    return config;
  });

  axios.interceptors.response.use((response) => {
    const config = response.config;
    const delta = Date.now() - config.requestTimestamp;
    debug(`${config.method} ${config.url}, time=${delta} msec`);
    return response;
  });
}

module.exports = {
  use,
};
