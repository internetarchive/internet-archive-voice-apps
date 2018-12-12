const { debug } = require('../../utils/logger/index')('ia:actions:middleware:rewind-top-the-first-song');

/**
 * Rewind to the first song
 *
 * @returns {function(*=): *}
 */
const rewindToTheFirstSong = () => (ctx) => {
  debug('start');
  const { feeder } = ctx;
  return feeder.first(ctx);
};

module.exports = {
  rewindToTheFirstSong,
};
