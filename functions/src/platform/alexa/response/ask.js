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
  ({speech, suggestions}) => {
    alexa.response.speak(speech);
  };
