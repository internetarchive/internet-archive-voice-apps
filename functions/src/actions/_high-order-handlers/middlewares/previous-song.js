const { MiddlewareError } = require('./errors');
const { debug } = require('../../../utils/logger')('ia:actions:middlewares:next-song');

/**
 * move to the previous song
 * and fails if we haven't found it
 */
module.exports = () => (ctx) => {
  debug('start');
  const { feeder } = ctx;
  if (!feeder.hasPrevious(ctx)) {
    debug(`don't have previous song`);
    return Promise.reject(new MiddlewareError(ctx, `don't have previous song`));
  }

  return feeder.previous(ctx)
    .then(() => ctx);
};
