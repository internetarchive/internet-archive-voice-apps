module.exports = {
  fsm: {
    /**
     * those states should match with states in ./actions/
     */
    states: {
      HELP: 'help',
      RECOMMEND: 'recommend',
      PLAYBACK: 'playback',
      PLAYBACK_IS_STOPPED: 'playback-is-stopped',
      PLAYLIST_IS_ENDED: 'playlist-is-ended',
      // we hit the playlist end by trying to get previous song
      PLAYLIST_IS_ENDED_FROM_BEGIN: 'playlist-is-ended-from-begin',
      SEARCH_MUSIC: 'search-music',
      WELCOME: 'welcome',
    },
  },
};
