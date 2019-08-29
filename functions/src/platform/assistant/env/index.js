const _ = require('lodash');
const functions = require('firebase-functions');

module.exports = (group, prop) => {
  return _.get(functions.config(), [group, prop]);
};
