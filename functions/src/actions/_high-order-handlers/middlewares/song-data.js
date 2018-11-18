const mustache = require('mustache');

const selectors = require('../../../configurator/selectors');
const playback = require('../../../state/playback');
const availableStrings = require('../../../strings').dialog.playSong;
const escapeHTMLObject = require('../../../utils/escape-html-object');
const { debug } = require('../../../utils/logger')('ia:actions:middlewares:song-data');

const errors = require('./errors');

class EmptySongDataError extends errors.MiddlewareError {

}

const songGetters = {
  current: ({ app, playlist }) => playlist.getCurrentSong(app),
  next: ({ app, playlist }) => playlist.getNextSong(app),
};

/**
 * Get songs data from playlist and them to slots
 * @param {string} type
 * @returns {function(*=): *}
 */
module.exports = ({ type = 'current' } = {}) => (ctx) => {
  debug('start');
  let { app, slots = {}, speech = [] } = ctx;
  const song = songGetters[type](ctx);

  if (!song) {
    return Promise.reject(new EmptySongDataError(ctx, 'there is no song data'));
  }

  const mute = playback.isMuteSpeechBeforePlayback(app);

  slots = Object.assign({}, slots, escapeHTMLObject(song, { skipFields: ['audioURL', 'imageURL'] }));

  const strings = selectors.find(availableStrings, slots);

  // TODO: maybe it would be better to use mustache later
  // with resolvers and render-speech
  const description = mustache.render(strings.description, slots);

  if (mute) {
    const wordless = selectors.find(strings.wordless, slots);
    if (wordless && wordless.speech) {
      speech = [].concat(speech, wordless.speech);
    }
  } else {
    speech = [].concat(speech, description);
  }

  return Promise.resolve({
    ...ctx,
    slots,
    speech,
    description,
  });
};
