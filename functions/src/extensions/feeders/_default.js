const mustache = require('mustache');

const config = require('../../config');
const songsProvider = require('../../provider/songs');
const {debug} = require('../../utils/logger')('ia:feeder:default');
const rebortEscape = require('../../utils/reborn-escape');

class DefaultFeeder {
  build ({app, query, playlist}) {
    throw new Error('Not Implemented!');
  }

  /**
   * Do we have any songs here?
   *
   * @param slots
   * @param playlist
   * @returns {boolean}
   */
  isEmpty ({app, slots, playlist}) {
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
  getCurrentItem ({app, playlist}) {
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
  hasNext ({app, slots, playlist}) {
    return playlist.hasNextSong(app);
  }

  /**
   * Move to the next song
   *
   * TODO: should be async because we could have multiple albumns here
   *
   * @returns {Promise.<T>}
   */
  next ({app, slots, playlist}) {
    debug('move to the next song');
    playlist.next(app);
    return Promise.resolve();
  }

  /**
   * Process album songs
   *
   * @protected
   * @param album
   * @returns {Array}
   */
  processAlbumSongs (album) {
    return album.songs
      .map((song, idx) => Object.assign({}, song, {
        audioURL: songsProvider.getSongUrlByAlbumIdAndFileName(
          album.id, rebortEscape(song.filename)),
        collections: album.collections,
        coverage: album.coverage,
        creator: album.creator,
        imageURL: mustache.render(config.media.POSTER_OF_ALBUM, album),
        // TODO : add recommendations
        suggestions: ['Next'],
        album: {
          id: album.id,
          title: album.title,
        },
        track: idx + 1,
        year: album.year,
      }));
  }
}

module.exports = DefaultFeeder;
