const groupParamToEnvVarName = require('./group-param-to-env-variable-name');

/**
 * Get config env variable
 *
 * @param group {String}
 * @param prop {String}
 * @returns {String}
 */
module.exports = (platform) => (group, prop) => {
  let res;

  switch (platform) {
    case 'assistant':
      res = require('../platform/assistant/env')(group, prop);
      break;
    default: {
      const key = groupParamToEnvVarName(group, prop);
      res = key ? process.env[key] : process.env;
      break;
    }
  }

  if (typeof res === 'string') {
    if (res.toLowerCase() === 'true') {
      return true;
    }

    if (res.toLowerCase() === 'false') {
      return false;
    }
  }

  return res;
};
