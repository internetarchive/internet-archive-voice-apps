const {getData, setData} = require('./helpers').group('playlist');

/**
 * Current song in the Playlist
 *
 * @param app
 * @returns {{id: string, title: string}}
 */
function getCurrentSong (app) {
  const playlist = getData(app);
  return playlist.items[playlist.current];
}

/**
 * Do we have next song
 *
 * @param app
 * @returns {boolean}
 */
function hasNextSong (app) {
  const playlist = getData(app);
  return playlist.current < playlist.items.length - 1;
}

/**
 * Choose next song
 *
 * @param app
 */
function next (app) {
  const playlist = getData(app);
  setData(app, Object.assign({}, playlist, {
    current: playlist.current + 1,
  }));
}


module.exports = {
  getCurrentSong,
  hasNextSong,
  next,
};
