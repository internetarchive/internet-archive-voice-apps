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

      let mediaObjects = [];
      if (media) {
        mediaObjects = media.map(m =>
          app.buildMediaObject(m.name, m.contentURL)
            .setDescription(m.description)
            .setImage(m.imageURL)
        );
      }

      if (mediaObjects) {
        response.addMediaResponse(
          app.buildMediaResponse()
            .addMediaObjects(mediaObjects)
        );
      }

      if (!Array.isArray(speech)) {
        speech = [speech];
      }

      speech.forEach(
        s => response.addSimpleResponse(`<speak>${s}</speak>`)
      );

      if (suggestions) {
        const simpleSuggestions = suggestions.filter(s => typeof s === 'string');
        if (simpleSuggestions) {
          response.addSuggestions(simpleSuggestions);
        }
        const suggestingsWithLink = suggestions.filter(s => s.url);
        suggestingsWithLink.forEach(
          s => response.addSuggestionLink(s.title, s.url)
        );
      }

      app.ask(response);
    }
  };
