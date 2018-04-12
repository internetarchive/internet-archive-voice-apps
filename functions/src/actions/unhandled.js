const {warning} = require('../utils/logger')('ia:actions:unhandled');

function handler (app) {
  // TODO: should log unhandled itents to Sentry
  warning('Catch unhandled intent');
}

/**
 * handle Alexa Unhandled intent
 * TODO: could cover unhandled for Google Assistant as well
 * @type {{handler: handler}}
 */
module.exports = {
  handler,
};
