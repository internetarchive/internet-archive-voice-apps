const { debug } = require('../../utils/logger/index')('ia:actions:middleware:rewind-top-the-last-song');

/**
 * Rewind to the last song
 *
 * @returns {function(*=): *}
 */
const rewindToTheLastSong = () => (ctx) => {
  debug('start');
  const { feeder } = ctx;
  return feeder.last(ctx);
};

module.exports = {
  rewindToTheLastSong,
};
