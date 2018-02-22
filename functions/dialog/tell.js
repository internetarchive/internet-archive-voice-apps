/**
 * tell to user without waiting for feedback
 *
 * @param app
 * @param speech {string}
 */
module.exports = function tell (app, {speech}) {
  app.tell(app.buildRichResponse()
    .addSimpleResponse(speech));
};
