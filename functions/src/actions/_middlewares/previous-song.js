const { debug } = require('../../utils/logger/index')('ia:actions:middlewares:next-song');

const errors = require('./errors');

class DoNotHavePreviousSongError extends errors.EndOfThePlaylistError {
}

/**
 * move to the previous song
 * and fails if we haven't found it
 */
const previousSong = () => (ctx) => {
  debug('start');
  const { feeder } = ctx;
  if (!feeder.hasPrevious(ctx)) {
    debug('don\'t have previous song');
    return Promise.reject(new DoNotHavePreviousSongError(ctx, 'don\'t have previous song'));
  }

  return feeder.previous(ctx)
    .then(() => ctx);
};

module.exports = {
  DoNotHavePreviousSongError,
  previousSong,
};
