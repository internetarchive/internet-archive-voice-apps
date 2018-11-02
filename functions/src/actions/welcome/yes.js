const strings = require('../../strings');

const helpers = require('../_helpers');

module.exports = {
  handler: (app) => helpers.simpleResponse(app, strings.intents.welcome.yes),
};
