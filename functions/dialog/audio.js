/**
 * play audio response to the user
 *
 * @param app
 * @param audioURL {string}
 * @param coverage {string}
 * @param suggestions {string|Array<string>}
 * @param track {number}
 * @param title {string}
 * @param year {number}
 */
function audio (app, {audioURL, coverage, suggestions, track, title, year}) {
  app.ask(app.buildRichResponse()
    .addSimpleResponse('Playing track - ' + title + ', ' + coverage + ', ' + year)
    .addMediaResponse(app.buildMediaResponse()
      .addMediaObjects([app.buildMediaObject('Playing track number - ' + track, audioURL)
        .setDescription('Playing track - ' + title + ', ' + coverage + ', ' + year)
        .setImage('http://archive.org/images/notfound.png', app.Media.ImageType.LARGE)
      ])
    )
    .addSuggestions(suggestions)
    .addSuggestionLink('on Archive.org', audioURL));
}

module.exports = {
  audio,
};
