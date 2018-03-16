const audio = require('./audio');

let pipeline = null;

function use (value) {
  pipeline = value;
}

module.exports = {
  ask: require('./ask'),
  playSong: (app, options) => {
    if (pipeline) {
      options = pipeline.process(app, options);
    }
    return audio.playSong(app, options);
  },
  processOptions: audio.processOptions,
  tell: require('./tell'),
  use,
};
