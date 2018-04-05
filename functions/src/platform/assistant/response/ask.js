module.exports = (app) =>
  /**
   * Response with question
   *
   * @param speech {String}
   * @param suggestions {Array}
   */
  (speech, suggestions) => {
    if (!suggestions) {
      app.ask(speech);
    } else {
      app.ask(app.buildRichResponse()
        .addSimpleResponse(speech)
        .addSuggestions(suggestions));
    }
  };
