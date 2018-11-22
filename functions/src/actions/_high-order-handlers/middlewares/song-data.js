const mustache = require('mustache');

const selectors = require('../../../configurator/selectors');
const playback = require('../../../state/playback');
const availableStrings = require('../../../strings').dialog.playSong;
const escapeHTMLObject = require('../../../utils/escape-html-object');
const { debug, info } = require('../../../utils/logger')('ia:actions:middlewares:song-data');

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

  const slotsWithOriginalSongDetails = {
    ...slots,
    ...song,
  };

  const slotsWithEscapedSongDetails = {
    ...slots,
    ...escapeHTMLObject(song, { skipFields: ['audioURL', 'imageURL'] }),
  };

  const playbackUIScheme = selectors.find(availableStrings, slotsWithOriginalSongDetails);

  let songSpeech;

  if (playback.isMuteSpeechBeforePlayback(app)) {
    let wordless = selectors.find(playbackUIScheme.wordless, slotsWithEscapedSongDetails);
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
