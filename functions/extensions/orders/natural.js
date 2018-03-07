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
