function handler (app) {
  app.spotPlayback();
}

/**
 * handle Alexa Amazon.PauseIntent
 * @type {{handler: handler}}
 */
module.exports = {
  handler,
};
