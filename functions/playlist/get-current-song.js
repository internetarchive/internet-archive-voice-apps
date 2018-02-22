/**
 * Current song in the Playlist
 *
 * @param {function} getData
 * @param app
 * @returns {{id: string, title: string}}
 */
function getCurrentSong({getData}, app) {
  const playlist = getData(app);
  return playlist.list[playlist.current];
}

module.exports = {
  getCurrentSong,
};
