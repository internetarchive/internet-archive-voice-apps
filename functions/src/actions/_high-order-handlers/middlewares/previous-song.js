const { MiddlewareError } = require('./errors');
const { debug } = require('../../../utils/logger')('ia:actions:middlewares:next-song');

/**
 * move to the previous song
 * and fails if we haven't found it
 */
module.exports = () => (ctx) => {
  debug('start');
  const { feeder } = ctx;
  // TODO: replace 'next' with 'previous'
  if (!feeder.hasNext(ctx)) {
    // TODO: Don't have next song
    debug(`don't have next song`);
    return Promise.reject(new MiddlewareError(ctx, `don't have next song`));
  }

  return feeder.next(ctx)
    .then(() => ctx);
};
