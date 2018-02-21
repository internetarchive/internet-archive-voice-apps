/**
 * tell to user without waiting for feedback
 *
 * @param app
 * @param message
 */
module.exports = function tell (app, message) {
  app.tell(app.buildRichResponse()
    .addSimpleResponse(message));
};
