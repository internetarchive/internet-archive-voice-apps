const {Image, LinkOutSuggestion, MediaObject, Suggestions} = require('actions-on-google');

const {debug} = require('../../../utils/logger')('ia:platform.assistant.response');

module.exports = (app) =>
  /**
   * Response with question
   *
   * @param speech {String}
   * @param suggestions {Array}
   * @param close {Boolean} close connection (end session). By default is false.
   */
  ({media, speech, suggestions, close = false}) => {
    let responses;

    responses = [].concat(speech)
      .map(s => `<speak>${s}</speak>`);

    if (suggestions) {
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

    if (close) {
      debug('app.close');
      responses.forEach(r => app.close(r));
    } else {
      debug('app.ask');
      responses.forEach(r => app.ask(r));
    }
  };
