const {debug} = require('../utils/logger')('ia:actions:pause-intent');

function handler (app) {
  // TODO: should use common API app.response instead
  debug('stop playing music');
  app.ctx.response.audioPlayerStop();
}

/**
 * handle Alexa Amazon.PauseIntent
 * @type {{handler: handler}}
 */
module.exports = {
  handler,
};
