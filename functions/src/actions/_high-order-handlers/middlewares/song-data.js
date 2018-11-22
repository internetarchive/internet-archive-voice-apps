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

  const playbackUIScheme = selectors.find(availableStrings, slots);

  const slotsWithEscapedSongDetails = {
    ...slots,
    ...escapeHTMLObject(song, { skipFields: ['audioURL', 'imageURL'] }),
  };

  // TODO: maybe it would be better to use mustache later
  // with resolvers and render-speech

  const mute = playback.isMuteSpeechBeforePlayback(app);
  if (mute) {
    const wordless = selectors.find(playbackUIScheme.wordless, slotsWithEscapedSongDetails);
    if (wordless && wordless.speech) {
      speech = [].concat(speech, wordless.speech);
    }
  } else {
    const songSpeech = mustache.render(playbackUIScheme.description, slotsWithEscapedSongDetails);
    speech = [].concat(speech, songSpeech);
  }

  const slotsWithOriginalSongDetails = {
    ...slots,
    ...song,
  };

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
