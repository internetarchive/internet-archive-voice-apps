const { debug } = require('../../utils/logger')('ia:order:natural');

class NaturalOrderStrategy {
  /**
   * Get paging for fetching data from source
   *
   * @param app
   * @param cursor
   * @param feederConfig
   * @returns {{limit: number, page: number}}
   */
  getPage ({ app, cursor, feederConfig }) {
    return {
      // size of chunk
      limit: feederConfig.chunk.albums,
      // request next portion of albums
      page: Math.floor(cursor.current.album / feederConfig.chunk.albums),
    };
  }

  /**
   * Do we have next item
   *
   * @param app
   * @param playlist
   * @returns {boolean}
   */
  hasNext ({ app, playlist }) {
    const cursor = playlist.getExtra(app).cursor;
    // Isn't it the last album
    if (cursor.current.album < cursor.total.albums - 1) {
      return true;
    }
    // Isn't it the last song?
    return cursor.current.song < cursor.total.songs - 1;
  }

  /**
   * Move source cursor to the next position
   * @param app
   * @param query
   * @param playlist
   */
  moveSourceCursorToTheNextPosition ({ app, query, playlist }) {
    const cursor = playlist.getExtra(app).cursor;
    const current = Object.assign({}, cursor.current);
    current.song++;
    if (current.song >= cursor.total.songs) {
      debug('move cursor to a next album');
      current.song = 0;
      current.album++;
      if (current.album >= cursor.total.albums) {
        debug('the end of playlist');
        current.album--;
      }
    } else {
      debug('move cursor to a next song');
    }

    // store cursor
    playlist.setExtra(app, {
      cursor: Object.assign({}, cursor, { current }),
    });
  }

  /**
   * Do we have previous item
   */
  hasPrevious ({ app, playlist }) {
    const { current } = playlist.getExtra(app).cursor;

    // Isn't it the 1st album
    if (current.album > 0) {
      return true;
    }

    // Isn't it the 1st song?
    return current.song > 0;
  }

  /**
   * Should update total number of songs
   * actually we could get new number
   * when we switch to the new album
   *
   * @param playlist
   * @param songsInFirstAlbum
   */
  updateCursorTotal ({ app, playlist, songsInFirstAlbum }) {
    const cursor = playlist.getExtra(app).cursor;
    const total = Object.assign({}, cursor.total);
    total.songs = songsInFirstAlbum;
    playlist.setExtra(app, {
      cursor: Object.assign({}, cursor, { total }),
    });
  }

  /**
   * to chap few songs at the start because we've already fetched them
   *
   * @param songs
   * @returns {Array}
   */
  songsPostProcessing ({ cursor, songs }) {
    // start from song we need
    return songs.slice(cursor.current.song);
  }
}

module.exports = new NaturalOrderStrategy();
