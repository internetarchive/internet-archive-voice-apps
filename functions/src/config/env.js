const functions = require('firebase-functions');
const _ = require('lodash');

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
      res = _.get(functions.config(), [group, prop]);
      break;
    default:
      res = process.env[groupParamToEnvVarName(group, prop)];
      break;
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
