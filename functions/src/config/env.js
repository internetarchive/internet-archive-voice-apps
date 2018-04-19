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
  switch (platform) {
    case 'assistant':
      return _.get(functions.config(), [group, prop]);
    default:
      return process.env[groupParamToEnvVarName(group, prop)];
  }
};
