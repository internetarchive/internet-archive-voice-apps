const mustache = require('mustache');

const config = require('../config');
const strings = require('../strings').dialog.playSong;
const {debug} = require('../utils/logger')('ia:dialog:audio');

/**
 * Construct <audio/> SSML tag from passed arguments
 *
 * @private
 * @param description
 * @param url
 * @returns {string}
 */
function ssmlAudio ({description, url}) {
  return `
    <media soundLevel="-40db">
      <audio src="${url}">
        <desc>${description}</desc>
      </audio>
    </media>
  `;
}

/**
 * Play song to the user
 *
 * @param app
 * @param {Object} options
 * @param {string} options.audioURL - The Link to the track
 * @param {string} options.coverage - The Desciption of Places
 * @param {string} options.imageURL - The Link to the track image
 * @param {string|Array<string>} options.suggestions
 * @param {Object} options.speech - customize speech before song
 * @param {number} options.track
 * @param {string} options.title
 * @param {number} options.year
 */
function playSong (app, options) {
  debug(`Play song: ${JSON.stringify(options)}`);
  const description = mustache.render(strings.description, options);
  let response = app.buildRichResponse();
  const {speech} = options;

  if (speech && speech.mute) {
    const {audio} = speech;
    response = response.addSimpleResponse(`
      <speak>
       ${ssmlAudio(Object.assign({}, audio, {description}))}
      </speak>`
    );
  } else {
    response = response.addSimpleResponse(description);
  }

  response = response
    .addMediaResponse(app.buildMediaResponse()
      .addMediaObjects([app.buildMediaObject(
        mustache.render(strings.title, options),
        options.audioURL
      )
        .setDescription(description)
        .setImage(
          options.imageURL || config.media.DEFAULT_SONG_IMAGE,
          app.Media.ImageType.LARGE
        )
      ])
    )
    .addSuggestions(options.suggestions)
    .addSuggestionLink(
      mustache.render(strings.suggestionLink, options),
      mustache.render(config.endpoints.ALBUM_DETAIL, options)
    );

  app.ask(response);
}

module.exports = {
  playSong,
};
