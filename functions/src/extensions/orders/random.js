const _ = require('lodash');

class RandomOrderStrategy {
  clampCursorSongPosition () {

  }

  /**
   * Get paging for fetching data from source
   *
   * @param feederConfig
   * @returns {{limit: number, page: number}}
   */
  getPage ({ feederConfig }) {
    return {
      // size of chunk
      limit: feederConfig.chunk.albums,
      page: 0,
    };
  }

  getNextCursorPosition ({ current }) {
    return current;
  }

  /**
   * Get next item in playlist
   *
   * @param app
   * @param playlist
   * @returns {int}
   */
  getNextItem ({ app, playlist }) {
    return _.sample(playlist.getItems(app));
  }

  /**
   * Get previous cursor position
   *
   * @param current
   * @returns {int}
   */
  getPreviousCursorPosition ({ current }) {
    return current;
  }

  /**
   * Do we have previous item
   *
   * Should always have previous item if feeder is valid
   *
   * @param app
   * @param slots
   * @param playlist
   * @returns {boolean}
   */
  hasPrevious ({ app, query, playlist }) {
    return !playlist.isEmpty(app);
  }

  /**
   * Do we have next item
   *
   * Should always have next item if feeder is valid
   *
   * @param app
   * @param slots
   * @param playlist
   * @returns {boolean}
   */
  hasNext ({ app, query, playlist }) {
    return !playlist.isEmpty(app);
  }

  /**
   * Update cursor total.
   *
   * We don't need it for the random strategy.
   */
  updateCursorTotal () {

  }

  /**
   * Songs postprocessing
   *
   * Suffle songs
   *
   * @param songs
   * @returns {Array}
   */
  songsPostProcessing ({ songs }) {
    return songs.sort(() => Math.random() - 0.5);
  }
}

module.exports = new RandomOrderStrategy();
