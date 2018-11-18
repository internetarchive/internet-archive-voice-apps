const helpers = require('../playback/_helpers');

function handler (app) {
  return helpers.playSong({
    app,
    skip: 'to-the-last',
  });
}

module.exports = {
  handler,
};
