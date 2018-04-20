const axios = require('axios');
const hirestime = require('hirestime');

const {debug} = require('../utils/logger')('ia:performance:axio');

/**
 * Use profile axios performance
 */
function use () {
  debug('use');
  axios.interceptors.request.use((config) => {
    config.elapsed = hirestime();
    return config;
  });

  axios.interceptors.response.use((response) => {
    const config = response.config;
    debug(`${config.method} ${config.url}, time=${config.elapsed()} msec`);
    return response;
  });
}

module.exports = {
  use,
};
