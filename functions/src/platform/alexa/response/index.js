const Alexa = require('ask-sdk-core');

const { debug } = require('../../../utils/logger')('ia:platform:alexa:response');

/**
 * Create alexa response builder wrapper
 *
 * @param handlerInput
 */
module.exports = (handlerInput) =>
  /**
   * Response with question
   *
   * @param {boolean} close - close session
   * @param media {Array}
   * @param mediaResponseOnly {boolean}
   * @param speech {String}
   * @param suggestions {Array}
   * @param text {String}
   */
  ({ close = false, media, mediaResponseOnly, speech, suggestions, text = null }) => {
    debug('start');
    if (!Array.isArray(speech)) {
      speech = [speech];
    }
    speech = speech.join('\n');

    if (speech) {
      if (mediaResponseOnly) {
        debug('speech is not allowed');
      } else {
        debug('speak', speech);
        handlerInput.responseBuilder.speak(speech);
        if (text) {
          handlerInput.responseBuilder.withStandardCard('Internet Archive', text);
        }
      }
    } else {
      debug('there is nothing to speak');
    }

    if (media) {
      media.forEach(m => {
        const previousToken = m.previousTrack ? m.previousTrack.contentURL : null;
        debug('previous token', previousToken);
        if (mediaResponseOnly) {
          // https://developer.amazon.com/docs/custom-skills/audioplayer-interface-reference.html#playbacknearlyfinished
          debug('card is not allowed');
        } else {
          debug('render card', m.name, m.description);
          if (m.imageURL) {
            handlerInput.responseBuilder.withStandardCard(m.name, m.description, m.imageURL);
          } else {
            handlerInput.responseBuilder.withSimpleCard(m.name, m.description);
          }
        }

        const art = new Alexa.ImageHelper()
          .withDescription(m.name)
          .addImageInstance(m.imageURL)
          .getImage();

        // TODO: we could find better image for background
        const backgroundImage = art;

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
          previousToken,
          // audioItemMetadata
          {
            // This is typically used for the audio track title.
            title: m.name,
            // Subtitle text to display, such as a category or an artist name.
            subtitle: m.description,
            // An Image object representing the album art to display.
            // This object uses the same format as images used in the Display interface templates.
            art,

            backgroundImage
            // more about format of image
            // https://developer.amazon.com/docs/custom-skills/display-interface-reference.html#image-object-specifications
            // and guide lines about image
            // https://developer.amazon.com/docs/custom-skills/audioplayer-interface-reference.html#images
          }
        );
      });
      handlerInput.responseBuilder.withShouldEndSession(true);
    } else {
      handlerInput.responseBuilder.withShouldEndSession(close);
    }

    if (suggestions) {
      if (mediaResponseOnly) {
        debug('we shouldn\'t give hints');
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
