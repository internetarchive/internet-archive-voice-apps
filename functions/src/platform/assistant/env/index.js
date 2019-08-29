const _ = require('lodash');
const functions = require('firebase-functions');

module.exports = (group, prop) => {
  const config = functions.config();
  if (group && prop) {
    return _.get(config, [group, prop]);
  } else {
    return config;
  }
};
