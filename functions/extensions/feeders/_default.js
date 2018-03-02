const debug = require('debug')('ia:feeder:default:debug');

class DefaultFeeder {
  build (app, query, playlist) {
    throw new Error('Not Implemented!');
  }

  /**
   * Do we have any songs here?
   *
   * @param slots
   * @param playlist
   * @returns {boolean}
   */
  isEmpty (app, slots, playlist) {
    return playlist.isEmpty(app);
  }

  /**
   * Current item of feeder
   *
   * @param app
   * @param slots
   * @param playlist
   * @returns {{id: string, title: string}}
   */
  getCurrentItem (app, slots, playlist) {
    return playlist.getCurrentSong(app);
  }

  /**
   * Do we have next item?
   *
   * @param app
   * @param slots
   * @param playlist
   * @returns {boolean}
   */
  hasNext (app, slots, playlist) {
    return playlist.hasNextSong(app);
  }

  /**
   * Move to the next song
   *
   * TODO: should be async because we could have multiple albumns here
   *
   * @returns {Promise.<T>}
   */
  next (app, slots, playlist) {
    debug('move to the next song');
    playlist.next(app);
    return Promise.resolve();
  }
}

module.exports = DefaultFeeder;
