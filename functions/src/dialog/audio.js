const debug = require('debug')('ia:dialog:audio:debug');
const mustache = require('mustache');

const config = require('../config');
const strings = require('../strings').dialog.playSong;

/**
 * play song to the user
 *
 * @param app
 * @param {Object} options
 * @param {string} options.audioURL - The Link to the track
 * @param {string} options.coverage - The Desciption of Places
 * @param {string} options.imageURL - The Link to the track image
 * @param {string|Array<string>} options.suggestions
 * @param {number} options.track
 * @param {string} options.title
 * @param {number} options.year
 */
function playSong (app, options) {
  debug(`Play song: ${JSON.stringify(options)}`);
  const description = mustache.render(strings.description, options);
  app.ask(app.buildRichResponse()
    .addSimpleResponse(description)
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
    )
  );
}

module.exports = {
  playSong,
};
