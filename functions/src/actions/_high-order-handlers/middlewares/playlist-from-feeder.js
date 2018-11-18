const { debug, warning } = require('../../../utils/logger')('ia:actions:middlewares:playlist-from-feeder');
const { MiddlewareError } = require('./errors');

/**
 * Build playlist data from feeder
 */
module.exports = () => (ctx) => {
  debug('start');
  const { app, feeder, feederName, playlist, slots } = ctx;
  playlist.setFeeder(app, feederName);
  return feeder
    .build(ctx)
    .then(res => {
      if (feeder.isEmpty(ctx)) {
        // TODO: should give feedback about problem
        debug('empty playlist');
        return Promise.reject(new MiddlewareError(ctx, { emptyPlaylist: true }));
      }
      return {
        ...ctx,
        slots: { ...slots, total: res.total },
      };
    }, error => {
      warning('fail on creating playlist. Got Error:', error);
      return Promise.reject(new MiddlewareError(ctx, error));
    });
};
