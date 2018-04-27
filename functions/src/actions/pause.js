function handler (app) {
  app.stopPlayback();
}

/**
 * handle Alexa Amazon.PauseIntent
 * @type {{handler: handler}}
 */
module.exports = {
  handler,
};
