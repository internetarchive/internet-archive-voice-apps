const mustache = require('mustache');

const selectors = require('../../configurator/selectors/index');
const playback = require('../../state/playback');
const availableStrings = require('../../strings').dialog.playSong;
const escapeHTMLObject = require('../../utils/escape-html-object');
const { debug, info } = require('../../utils/logger/index')('ia:actions:middlewares:song-data');

const errors = require('./errors');

class EmptySongDataError extends errors.MiddlewareError {
}

const songGetters = {
  current: ({ app, playlist }) => playlist.getCurrentSong(app),
  next: (ctx) => ctx.feeder.getNextItem(ctx),
};

/**
 * Get songs data from playlist and put them to:
 * - speech
 * - description
 * - and slots
 *
 * @param {string} type
 * @returns {function(*=): *}
 */
const mapSongDataToSlots = ({ type = 'current' } = {}) => (ctx) => {
  debug('start');
  let { app, slots = {}, speech = [] } = ctx;
  const song = songGetters[type](ctx);

  if (!song) {
    info('there is no song data');
    return Promise.reject(new EmptySongDataError(ctx, 'there is no song data'));
  }

  // Preserve original coverage and year from user's selection if they exist,
  // so the response matches what the user selected rather than what the album has
  const originalCoverage = slots.coverage;
  const originalYear = slots.year;

  // we need to escape song data because they could have special symbols
  // like < or > but we should do it only for speech because it uses SSML
  const slotsWithEscapedSongDetails = {
    ...slots,
    ...escapeHTMLObject(song, { skipFields: ['audioURL', 'imageURL'] }),
    // Preserve user-selected coverage and year
    ...(originalCoverage && { coverage: originalCoverage }),
    ...(originalYear && { year: originalYear }),
  };

  // in all other cases we could have these special symbols
  const slotsWithOriginalSongDetails = {
    ...slots,
    ...song,
    // Preserve user-selected coverage and year to ensure response matches user's selection
    ...(originalCoverage && { coverage: originalCoverage }),
    ...(originalYear && { year: originalYear }),
  };

  const playbackUIScheme = selectors.find(availableStrings, slotsWithOriginalSongDetails);

  let songSpeech;

  if (playback.isMuteSpeechBeforePlayback(app)) {
    const wordless = selectors.find(playbackUIScheme.wordless, slotsWithEscapedSongDetails);
    if (wordless && wordless.speech) {
      songSpeech = wordless.speech;
    }
  } else {
    songSpeech = playbackUIScheme.description;
  }

  if (songSpeech) {
    // TODO: maybe it would be better to use mustache later
    // with resolvers and render-speech
    // but we should somehow pass both - encoded and non encoded data
    // maybe write resolver
    // but in the same time it shouldn't affect description
    speech = [].concat(speech, mustache.render(songSpeech, slotsWithEscapedSongDetails));
  }

  const description = mustache.render(playbackUIScheme.description, slotsWithOriginalSongDetails);
  return Promise.resolve({
    ...ctx,
    slots: slotsWithOriginalSongDetails,
    speech,
    description,
  });
};

module.exports = {
  EmptySongDataError,
  mapSongDataToSlots,
};
