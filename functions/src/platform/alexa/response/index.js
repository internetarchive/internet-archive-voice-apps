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
   * @param media {Array}
   * @param mediaResponseOnly {boolean}
   * @param speech {String}
   * @param suggestions {Array}
   */
  ({media, mediaResponseOnly, speech, suggestions}) => {
    debug('start');
    if (!Array.isArray(speech)) {
      speech = [speech];
    }
    speech = speech.join('\n');

    if (speech) {
      if (mediaResponseOnly) {
        debug('speachout is not allowed');
      } else {
        debug('speak', speech);
        alexa.response.speak(speech);
      }
    } else {
      debug('there is nothing to speak');
    }

    if (media) {
      media.forEach(m => {
        const previousToken = m.previousTrack ? m.previousTrack.contentURL : null;
        if (mediaResponseOnly) {
          // https://developer.amazon.com/docs/custom-skills/audioplayer-interface-reference.html#playbacknearlyfinished
          debug(`card is not allowed`);
        } else {
          debug('render card', m.name, m.description);
          alexa.response.cardRenderer(m.name, m.description, m.imageURL);
        }

        debug('playback audio', m.contentURL);
        alexa.response.audioPlayerPlay(
          // behavior,
          previousToken ? 'ENQUEUE' : 'REPLACE_ALL',
          m.contentURL,
          // token (This token cannot exceed 1024 characters)
          m.contentURL,
          // expectedPreviousToken
          previousToken,
          // offsetInMilliseconds
          m.offset
        );
      });
    } else {
      alexa.response.listen(speech);
    }
    if (suggestions) {
      if (mediaResponseOnly) {
        debug(`we shouldn't give hints`);
      } else {
        const textSuggestions = suggestions
          .filter(s => typeof s === 'string');

        if (textSuggestions.length > 0) {
          debug('hint', textSuggestions[0]);
          alexa.response.hint(textSuggestions[0]);
        }
      }
    }
  };
