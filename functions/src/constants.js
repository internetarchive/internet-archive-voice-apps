module.exports = {
  fsm: {
    /**
     * those states should match with states in ./actions/
     */
    states: {
      HELP: 'help',
      PLAYBACK: 'playback',
      PLAYBACK_IS_STOPPED: 'playback-is-stopped',
      SEARCH_MUSIC: 'search-music',
      WELCOME: 'welcome',
    },
  },
};
