const feeders = require('../../../extensions/feeders');
const { debug, warning } = require('../../../utils/logger')('ia:actions:middlewares:feeder-from-playlist');

const errors = require('./errors');

class EmptyFeederError extends errors.MiddlewareError {

}

/**
 * get feeder from playlist state
 */
const middleware = () => (ctx) => {
  debug('start');
  const { app, playlist } = ctx;
  const feederName = playlist.getFeeder(app);
  debug('feederName:', feederName);
  const feeder = feeders.getByName(feederName);
  if (!feeder) {
    warning(
      `for some reasons playlist asks "${feederName}" which we don't have`
    );
    return Promise.reject(new EmptyFeederError(ctx));
  }
  return Promise.resolve(Object.assign({}, ctx, { feeder, feederName }));
};

module.exports = {
  EmptyFeederError,
  middleware,
};
