const mustache = require('mustache');

const config = require('../config');
const strings = require('../strings').dialog.song;

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
function song (app, options) {
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
          options.imageURL || config.defaultSongImage,
          app.Media.ImageType.LARGE
        )
      ])
    )
    .addSuggestions(options.suggestions)
    .addSuggestionLink(
      mustache.render(strings.suggestionLink, options),
      options.audioURL
    )
  );
}

module.exports = {
  song,
};
