const mustache = require('mustache');
const util = require('util');

const config = require('../config');
const selectors = require('../configurator/selectors');
const availableStrings = require('../strings').dialog.playSong;
const { debug } = require('../utils/logger')('ia:dialog:audio');

const endpointProcessor = require('../network/endpoint-processor');

/**
 * Play song to the user
 *
 * @param app
 * @param {Object} options
 * @param {string} options.audioURL - The Link to the track
 * @param {string} options.coverage - The Description of Places
 * @param {string} options.imageURL - The Link to the track image
 * @param {string|Array<string>} options.suggestions
 * @param {number} options.mediaResponseOnly - don't give any other reponse expect media response
 * it doesn't work completely on Google Assistant - because it doesn't allow to give
 * media response without text message.
 * In contract to it Alexa doesn't allow to get response with text messages on next record
 * @param {Object} options.speech - customize speech before song
 * @param {number} options.track
 * @param {string} options.title
 * @param {number} options.year
 */
function playSong (app, options) {
  debug(`Play song: ${util.inspect(options)}`);
  const strings = selectors.find(availableStrings, options);
  const description = options.description || mustache.render(strings.description, options);

  let { speech } = options;

  if (typeof speech === 'string') {
    speech = mustache.render(speech, Object.assign({}, options, { description }));
  } else {
    speech = description;
  }

  const previousTrack = Object.assign({},
    options.previousTrack,
    { contentURL: options.previousTrack && options.previousTrack.audioURL });

  let suggestions = strings.suggestions;
  if (strings.suggestionLink && config.media.suggestionLink) {
    suggestions = suggestions.concat({
      url: endpointProcessor.preprocess(
        config.endpoints.ALBUM_DETAIL, app, options
      ),
      title: mustache.render(strings.suggestionLink, options),
    });
  }

  app.response({
    speech,

    media: [{
      name: mustache.render(strings.title, options),
      description,
      contentURL: options.audioURL,
      imageURL: options.imageURL || config.media.DEFAULT_SONG_IMAGE,
      offset: options.offset,

      // if previous track was define we try to stitch to it
      // for the moment it only works for Alexa
      previousTrack,
    }],

    mediaResponseOnly: options.mediaResponseOnly,

    suggestions,
  });
}

module.exports = {
  playSong,
};
