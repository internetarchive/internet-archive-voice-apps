const strings = require('./../../strings').intents.playback.unknown;

const helpers = require('./_helpers');

module.exports = {
  handler: app => helpers.resume(Object.assign({}, {app}, strings)),
};
