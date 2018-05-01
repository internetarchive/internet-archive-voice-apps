const feeders = require('../../../extensions/feeders');
const {debug, warning} = require('../../../utils/logger')('ia:actions:middlewares:feeder-from-playlist');

const errors = require('./errors');

class EmptyFeederError extends errors.MiddlewareError {

}

/**
 * get feeder from playlist state
 */
const middleware = () => (args) => {
  debug('start');
  const {app, playlist} = args;
  const feederName = playlist.getFeeder(app);
  debug('feederName:', feederName);
  const feeder = feeders.getByName(feederName);
  if (!feeder) {
    warning(
      `for some reasons playlist asks "${feederName}" which we don't have`
    );
    return Promise.reject(new EmptyFeederError(args));
  }
  return Promise.resolve(Object.assign({}, args, {feeder, feederName}));
};

module.exports = {
  EmptyFeederError,
  middleware,
};
