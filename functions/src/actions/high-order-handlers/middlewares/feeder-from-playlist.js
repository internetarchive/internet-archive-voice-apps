const feeders = require('../../../extensions/feeders');
const {debug, warning} = require('../../../utils/logger')('ia:actions:middlewares:feeder-from-playlist');

/**
 * get feeder from playlist state
 */
module.exports = () => (args) => {
  debug('start');
  const {app, playlist} = args;
  const feederName = playlist.getFeeder(app);
  debug('feederName:', feederName);
  const feeder = feeders.getByName(feederName);
  if (!feeder) {
    warning(
      `for some reasons playlist asks "${feederName}" which we don't have`
    );
    return Promise.reject(args);
  }
  return Promise.resolve(Object.assign({}, args, {feeder, feederName}));
};
