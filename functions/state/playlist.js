const {getData, setData} = require('./helpers').group('playlist');

/**
 * Selector. Current song in the Playlist
 *
 * @param app
 * @returns {{id: string, title: string}}
 */
function getCurrentSong (app) {
  const playlist = getData(app);
  return playlist.items[playlist.current];
}

/**
 * Selector. Do we have next song
 *
 * @param app
 * @returns {boolean}
 */
function hasNextSong (app) {
  const playlist = getData(app);
  return playlist.current < playlist.items.length - 1;
}

/**
 * Reducer: Create new playlist
 *
 * @param app
 * @param {Array} items - new songs
 */
function create (app, items) {
  setData(app, Object.assign({}, getData(app), {
    current: 0,
    items,
  }));
}

/**
 * Reducer: Choose next song
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
  create,
  hasNextSong,
  next,
};
