const debug = require('debug')('ia:actions:middleware:playback-fulfillment:debug');
const warning = require('debug')('ia:actions:middleware:playback-fulfillment:warning');

const dialog = require('../../../dialog');
const feeders = require('../../../extensions/feeders');

/**
 * Middleware
 * Create playlist based on fulfillment
 * and run playback
 *
 * @param app
 * @param playlist
 * @param query
 * @param slotsScheme
 * @returns {Promise}
 */
module.exports = () => ({app, playlist, query, slotScheme}) => {
  debug('apply playback fulfillment middleware');
  const feeder = feeders.getByName(slotScheme.fulfillment);
  if (!feeder) {
    // TODO: we should softly fallback here
    warning(
      `we need feeder "${slotScheme.fulfillment}" for fulfillment slot dialog`
    );
  } else {
    playlist.setFeeder(app, slotScheme.fulfillment);
    return feeder
      .build({app, query, playlist})
      .then(() => {
        if (feeder.isEmpty({app, query, playlist})) {
          // TODO: feeder can't find anything by music query
          // isn't covered case should be implemented
          dialog.ask(
            `We haven't find anything by your request would you like something else?`
          );
        } else {
          dialog.playSong(app, feeder.getCurrentItem({app, query, playlist}));
        }
      });
  }
};
