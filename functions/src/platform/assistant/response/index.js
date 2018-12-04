const _ = require('lodash');

const { Image, LinkOutSuggestion, MediaObject, SimpleResponse, Suggestions } = require('actions-on-google');

const platformConfig = require('../../../config').platforms.assistant;
const { debug, warning } = require('../../../utils/logger')('ia:platform.assistant.response');

/**
 *
 * Build response interface
 *
 * @param conv
 */
module.exports = (conv) =>
  /**
   * Response with question
   *
   * @param media {Object} media response
   * @param mediaResponseOnly {boolean}
   * @param speech {String|Array} speech
   * @param suggestions {Array} recommendations
   * @param text {String|Array} display text
   * @param close {Boolean} close connection (end session). By default is false.
   */
  ({ media, mediaResponseOnly, speech, suggestions, text, close = false }) => {
    let responses;

    if (mediaResponseOnly) {
      debug('media response only');
      responses = [platformConfig.minimalSpeechForMediaResponse];
    } else {
      responses = [].concat(speech)
        .map(s => `<speak>${s}</speak>`);
    }

    text = [].concat(text);

    responses = _.zip(responses, text).map(([speech, text]) => new SimpleResponse({
      speech,
      // if text is undefined we won't inject it to result object
      ...text && { text },
    }));

    if (suggestions) {
      debug('has suggestions');
      const simpleSuggestions = suggestions
        .filter(s => typeof s === 'string');
      if (simpleSuggestions) {
        responses.push(new Suggestions(simpleSuggestions));
      }

      responses = responses.concat(suggestions
        .filter(s => s.url)
        .map(s => new LinkOutSuggestion({
          name: s.title,
          url: s.url,
        })));
    }

    if (media) {
      debug('has media');
      responses = responses.concat(
        media.map(m => new MediaObject({
          name: m.name,
          url: m.contentURL,
          description: m.description,
          image: new Image({
            url: m.imageURL,
            alt: m.description,
          }),
        }))
      );
    }

    if (responses.length === 0) {
      warning(`doesn't have any response`);
      return;
    }

    if (close) {
      debug('app.close');
      responses.forEach(r => conv.close(r));
    } else {
      debug('app.ask');
      responses.forEach(r => conv.ask(r));
    }
  };
