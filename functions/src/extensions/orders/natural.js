const _ = require('lodash');

const { debug } = require('../../utils/logger')('ia:order:natural');

class NaturalOrderStrategy {
  /**
   * when we process function
   * orderStrategy.moveSourceCursorToThePreviousPosition
   * and step to the previous album
   * and should move to the last song in that album
   * we don't know this information
   * we should clamp this position
   *
   * @param app
   * @param playlist
   * @param maxValue
   */
  clampCursorSongPosition ({ app, playlist }, maxValue) {
    let extra = playlist.getExtra(app);
    extra = _.update(extra, 'cursor.current.song',
      value => Math.min(value, maxValue)
    );
    playlist.setExtra(app, extra);
  }

  /**
   * Get paging for fetching data from source
   *
   * @param currentCursor
   * @param feederConfig
   * @returns {{limit: number, page: number}}
   */
  getPage ({ currentCursor, feederConfig }) {
    return {
      // size of chunk
      limit: feederConfig.chunk.albums,
      // request next portion of albums
      page: Math.floor(currentCursor.album / feederConfig.chunk.albums),
    };
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
   * Where would we step on next record
   *
   * @param app
   * @param current
   * @param playlist
   * @returns {*}
   */
  getNextCursorPosition ({ app, current, playlist }) {
    const cursor = playlist.getExtra(app).cursor;
    current = Object.assign({}, current);
    current.song++;
    if (current.song >= cursor.total.songs) {
      debug('move cursor to a next album');
      current.song = 0;
      current.album++;
      if (current.album >= cursor.total.albums) {
        debug('the end of playlist');
        if (playlist.isLoop(app)) {
          current.album = 0;
          current.song = 0;
        } else {
          current.album--;
        }
      }
    } else {
      debug('move cursor to a next song');
    }

    return current;
  }

  getPreviousCursorPosition ({ app, current, playlist }) {
    const cursor = playlist.getExtra(app).cursor;
    current = { ...current };
    current.song--;
    if (current.song < 0) {
      debug('move cursor to a previous album');
      // we should set song to the last in an album
      // but because we don't know yet which is the last just set to the max available value
      // later we will use #clampCursorSongPosition to fit it to the right value
      current.song = 1e9;
      current.album--;
      if (current.album < 0) {
        debug('the begin of playlist');

        if (playlist.isLoop(app)) {
          current.album = cursor.total.albums - 1;
          current.song = 1e9;
        } else {
          current.album++;
        }
      }
    } else {
      debug('move cursor to a previous song');
    }

    return current;
  }

  moveSourceCursorToThePreviousPosition ({ app, query, playlist }) {
    const cursor = playlist.getExtra(app).cursor;
    const current = Object.assign({}, cursor.current);
    current.song--;
    if (current.song < 0) {
      debug('move cursor to a previous album');
      // we should set song to the last in an album
      // but because we don't know yet which is the last just set to the max available value
      // later we will use #clampCursorSongPosition to fit it to the right value
      current.song = 1e9;
      current.album--;
      if (current.album < 0) {
        debug('the begin of playlist');

        if (playlist.isLoop(app)) {
          current.album = cursor.total.albums - 1;
          current.song = 1e9;
        } else {
          current.album++;
        }
      }
    } else {
      debug('move cursor to a previous song');
    }

    // store cursor
    playlist.setExtra(app, {
      cursor: Object.assign({}, cursor, { current }),
    });
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
  songsPostProcessing ({ songs }) {
    return songs;
  }
}

module.exports = new NaturalOrderStrategy();
