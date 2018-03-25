const {debug, info} = require('../../../utils/logger')('ia:actions:middlewares:playlist-from-feeder');
const {MiddlewareError} = require('./error');

/**
 * Update playlist data from feeder
 * - usually we create new playlist
 */
module.exports = () => (context) => {
  debug('start');
  const {app, feeder, feederName, playlist, slots} = context;
  playlist.setFeeder(app, feederName);
  return feeder
    .build(context)
    .then(res => {
      if (feeder.isEmpty(context)) {
        // TODO: should give feedback about problem
        debug('empty playlist');
        return Promise.reject(new MiddlewareError(context, {emptyPlaylist: true}));
      }
      return Object.assign({}, context, {slots: Object.assign({}, slots, {total: res.total})});
    }, error => {
      info('fail on creating playlist', error);
      return Promise.reject(new MiddlewareError(context, error));
    });
};
