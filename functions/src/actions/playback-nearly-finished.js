const { debug, error } = require('../utils/logger')('ia:actions:playback-nearly-finished');

const helpers = require('./playback/_helpers');
const { EmptySongDataError } = require('./_middlewares/song-data');

function handler (app) {
  return helpers.enqueue({ app })
    .catch((err) => {
      if (!(err instanceof EmptySongDataError)) {
        error('we got unexpected error:', err);
      }

      // TODO: could we tell something to user after all?
      debug('playlist is ending');
    });
}

/**
 * handle Alexa AudioPlayer.PlaybackNearlyFinished intent
 * @type {{handler: handler}}
 */
module.exports = {
  handler,
};
