const {getData, setData} = require('../state/helpers').group('playlist');

module.exports = {
  getCurrentSong: require('./get-current-song')
    .getCurrentSong.bind(null, {getData, setData}),
};
