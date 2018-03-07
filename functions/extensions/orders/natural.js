class NaturalOrderStrategy {
  /**
   * Get paging for fetching data from source
   *
   * @param app
   * @param cursor
   * @param feederConfig
   * @returns {{limit: number, page: number}}
   */
  getPage ({app, cursor, feederConfig}) {
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
   * @param slots
   * @param playlist
   * @returns {boolean}
   */
  hasNext({app, query, playlist}) {
    const cursor = playlist.getExtra(app).cursor;
    // Isn't it the last album
    if (cursor.current.album < cursor.total.albums - 1) {
      return true;
    }
    // Isn't it the last song?
    return cursor.current.song < cursor.total.songs - 1;
  }

  /**
   * Chup few songs at the start because we've already fetched them
   *
   * @param songs
   * @returns {Array}
   */
  songsPostProcessing ({cursor, songs}) {
    // start from song we need
    return songs.slice(cursor.current.song);
  }
}

module.exports = new NaturalOrderStrategy();
