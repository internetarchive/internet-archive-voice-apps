const packageJSON = require('../../package.json');

const { getLastSuggestions } = require('../state/dialog');
const strings = require('../strings');

const helpers = require('./_helpers');

module.exports = {
  handler: app => helpers.simpleResponse(app,
    strings.intents.version.default,
    packageJSON,
    { suggestions: getLastSuggestions(app) }),
};
