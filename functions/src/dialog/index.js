const audio = require('./audio');

module.exports = {
  ask: require('./ask'),
  playSong: audio.playSong,
  tell: require('./tell'),
};
