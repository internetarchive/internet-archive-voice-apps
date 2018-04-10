const {MiddlewareError} = require('./error');
const {debug} = require('../../../utils/logger')('ia:actions:middlewares:playback-fulfillment');

/**
 * move to the next song
 * and fails if we haven't found it
 */
module.exports = () => (context) => {
  debug('start');
  const {feeder} = context;
  if (!feeder.hasNext(context)) {
    // TODO: Don't have next song
    debug(`don't have next song`);
    return Promise.reject(new MiddlewareError(context, `don't have next song`));
  }

  return feeder.next(context)
    .then(() => context);
};
