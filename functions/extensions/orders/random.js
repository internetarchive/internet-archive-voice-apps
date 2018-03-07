class RandomOrderStrategy {
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
      page: 0,
    };
  }

  /**
   * suffle songs
   *
   * @param songs
   * @returns {Array}
   */
  songsPostProcessing ({songs}) {
    return songs.sort(() => Math.random());
  }
}

module.exports = new RandomOrderStrategy();
