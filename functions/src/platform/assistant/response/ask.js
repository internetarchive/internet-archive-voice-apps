module.exports = (app) =>
  /**
   * Response with question
   *
   * @param speech {String}
   * @param suggestions {Array}
   */
  ({media, speech, suggestions}) => {
    if (!suggestions && !media && !Array.isArray(speech)) {
      app.ask(`<speak>${speech}</speak>`);
    } else {
      const response = app.buildRichResponse();

      if (!Array.isArray(speech)) {
        speech = [speech];
      }

      speech.forEach(
        s => response.addSimpleResponse(`<speak>${s}</speak>`)
      );

      if (suggestions) {
        response.addSuggestions(suggestions);
      }

      app.ask(response);
    }
  };
