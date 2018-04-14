function handler (app) {
  // TODO: should be context depended:
  // if nothing is playing right now we should say bay-bay and close the app
  app.spotPlayback();
}

/**
 * handle Alexa Amazon.PauseIntent
 * @type {{handler: handler}}
 */
module.exports = {
  handler,
};
