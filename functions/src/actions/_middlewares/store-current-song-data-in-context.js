/**
 * Store current song data in context
 */
const storeCurrentSongDataInContext = () => (ctx) => {
  const { app, playlist } = ctx;
  const currentSongData = playlist.getCurrentSong(app);
  return { ...ctx, currentSongData };
};

module.exports = {
  storeCurrentSongDataInContext
};
