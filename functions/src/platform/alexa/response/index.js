const {debug} = require('../../../utils/logger')('ia:platform:alexa:response');

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
    debug('start');
    if (!Array.isArray(speech)) {
      speech = [speech];
    }
    speech = speech.join('\n');

    debug('speak', speech);
    alexa.response.speak(speech);

    if (suggestions) {
      const textSuggestions = suggestions
        .filter(s => typeof s === 'string');

      if (textSuggestions.length > 0) {
        debug('hint', textSuggestions[0]);
        alexa.response.hint(textSuggestions[0]);
      }
    }

    if (media) {
      media.forEach(m => {
        debug('render card', m.name, m.description);
        alexa.response.cardRenderer(m.name, m.description, m.imageURL);

        debug('playback audio', m.contentURL);
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
    } else {
      alexa.response.listen(speech);
    }
  };
