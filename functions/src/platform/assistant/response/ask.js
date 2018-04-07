module.exports = (app) =>
  /**
   * Response with question
   *
   * @param speech {String}
   * @param suggestions {Array}
   */
  ({speech, suggestions}) => {
    if (!suggestions) {
      app.ask(`<speak>${speech}</speak>`);
    } else {
      app.ask(app.buildRichResponse()
        .addSimpleResponse(`<speak>${speech}</speak>`)
        .addSuggestions(suggestions));
    }
  };
