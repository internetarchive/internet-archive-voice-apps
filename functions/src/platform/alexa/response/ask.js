/**
 * create alexa.ask wrapper
 *
 * @param alexa
 */
module.exports = (alexa) =>
  /**
   * Response with question
   *
   * @param speech {String}
   * @param suggestions {Array}
   */
  ({media, speech, suggestions}) => {
    if (!Array.isArray(speech)) {
      speech = [speech];
    }
    speech = speech.join('\n');
    alexa.response.speak(speech).listen(speech);

    if (suggestions) {
      suggestions
        .filter(s => typeof s === 'string')
        .forEach(s => alexa.response.hint(s));
    }

    if (media) {
      media.forEach(m => {
        alexa.response.cardRenderer(m.name, m.description, m.imageURL);
        alexa.response.audioPlayerPlay(
          // behavior,
          'REPLACE_ALL',
          m.contentURL,
          // This token cannot exceed 1024 characters
          m.contentURL,
          null,
          0
        );
      });
    }
  };
