const env = require('../../config/env');

/**
 * we shouldn't use console
 * but it is trade-off because we can't be sure
 * that process.env will be patched form functions.config correctly
 */
module.exports = (platform) => {
  console.info(`initial process.env:`, process.env);
  const config = env(platform)();
  if (config !== process.env) {
    console.info(`initial config:`, config);
  }
};
