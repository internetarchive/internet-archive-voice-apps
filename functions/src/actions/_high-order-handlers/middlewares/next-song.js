const { debug } = require('../../../utils/logger')('ia:actions:middlewares:next-song');

const errors = require('./errors');

class DoNotHaveNextSongError extends errors.EndOfThePlaylistError {
}

/**
 * move to the next song
 * and fails if we haven't found it
 *
 * @param {boolean} move
 * @returns {Function}
 */
const nextSong = ({ move = true } = {}) => (ctx) => {
  debug('start');
  const { feeder } = ctx;
  if (!feeder.hasNext(ctx)) {
    // TODO: Don't have next song
    debug(`don't have next song`);
    return Promise.reject(new DoNotHaveNextSongError(ctx, `don't have next song`));
  }

  return feeder.next(ctx, move);
};

module.exports = {
  nextSong,
  DoNotHaveNextSongError,
};
