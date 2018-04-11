const {error, info} = require('../utils/logger')('ia:actions:session-ended-request');

function handler (app) {
  switch (app.params.getByName('reason')) {
    case 'USER_INITIATED':
      info('user close session');
      break;
    case 'ERROR':
      // send to sentry
      error(app.params.getByName('error').message);
      break;
    case 'EXCEEDED_MAX_REPROMPTS':
      info('exceeded max reptompts');
      break;
  }
  // TODO: save session
  // this.emit(':saveState', true);
}

/**
 * Handle Alexa intent 'SessionEndedRequest'
 *
 * @type {{handler: handler}}
 */
module.exports = {
  handler,
};
