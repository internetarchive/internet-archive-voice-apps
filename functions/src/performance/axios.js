const axios = require('axios');

const {debug, timer} = require('../utils/logger')('ia:performance:axio');

/**
 * Use profile axios performance
 */
function use () {
  debug('use');
  axios.interceptors.request.use((config) => {
    timer.start(`${config.method.toUpperCase()} ${config.url}`);
    return config;
  });

  axios.interceptors.response.use((response) => {
    timer.stop();
    return response;
  });
}

module.exports = {
  use,
};
