const _ = require('lodash');

const dialog = require('../dialog');
const strings = require('../strings').intents.unhandled;
const { warning } = require('../utils/logger')('ia:actions:unhandled');

function handler (app) {
  warning('we haven\'t found any valid handler');
  dialog.ask(app, _.sample(strings));
}

/**
 * handle Alexa Unhandled intent
 * cover unhandled for Google Assistant as well
 *
 * @type {{handler: handler}}
 */
module.exports = {
  handler,
};
