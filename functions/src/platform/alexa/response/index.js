const {debug} = require('../../../utils/logger')('ia:platform:alexa:response');

/**
 * Create alexa response builder wrapper
 *
 * @param handlerInput
 */
module.exports = (handlerInput) =>
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
        handlerInput.responseBuilder.speak(speech);
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
          if (m.imageURL) {
            handlerInput.responseBuilder.withStandardCard(m.name, m.description, m.imageURL);
          } else {
            handlerInput.responseBuilder.withSimpleCard(m.name, m.description);
          }
        }

        debug('playback audio', m.contentURL);
        handlerInput.responseBuilder.addAudioPlayerPlayDirective(
          // behavior,
          previousToken ? 'ENQUEUE' : 'REPLACE_ALL',
          m.contentURL,
          // token (This token cannot exceed 1024 characters)
          m.contentURL,
          // offsetInMilliseconds
          m.offset,
          // expectedPreviousToken
          previousToken
        );
      });
      handlerInput.responseBuilder.withShouldEndSession(true);
    } else {
      handlerInput.responseBuilder.withShouldEndSession(false);
    }

    if (suggestions) {
      if (mediaResponseOnly) {
        debug(`we shouldn't give hints`);
      } else {
        const textSuggestions = suggestions
          .filter(s => typeof s === 'string');

        if (textSuggestions.length > 0) {
          debug('hint', textSuggestions[0]);
          handlerInput.responseBuilder.addHintDirective(textSuggestions[0]);
        }
      }
    }
  };
