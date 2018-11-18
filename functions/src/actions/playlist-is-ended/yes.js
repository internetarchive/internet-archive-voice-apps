const helpers = require('../playback/_helpers');

function handler (app) {
  return helpers.playSong({
    app,
    skip: 'to-the-first',
  });
}

module.exports = {
  handler,
};
