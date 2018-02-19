/**
 * ask user with suggestions
 *
 * @param app
 * @param message
 * @param suggestions
 */
module.exports = function (app, message, suggestions = null) {
  app.ask(app.buildRichResponse()
    .addSimpleResponse(message)
    .addSuggestions(suggestions));

  app.data.context = {};
  app.data.context.dialog = {
    message,
    suggestions,
  };

  // context.saveDialog(app, {
  //   text: speechOutput,
  //   suggestion: suggestions,
  // });
};
