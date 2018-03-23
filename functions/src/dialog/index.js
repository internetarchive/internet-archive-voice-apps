const audio = require('./audio');

module.exports = {
  ask: require('./ask'),
  playSong: audio.playSong,
  processOptions: audio.processOptions,
  tell: require('./tell'),
};
