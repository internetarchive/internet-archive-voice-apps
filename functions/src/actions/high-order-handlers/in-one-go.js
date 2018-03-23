const dialog = require('../../dialog');
const {debug, warning} = require('../../utils/logger')('ia:actions:in-one-go');

const copyArgumentToSlots = require('./middlewares/copy-arguments-to-slots');
const copyDefaultsToSlots = require('./middlewares/copy-defaults-to-slots');
const feederFromSlotScheme = require('./middlewares/feeder-from-slots-scheme');
const fulfilResolvers = require('./middlewares/fulfil-resolvers');
const parepareSongData = require('./middlewares/song-data');
const playlistFromFeeder = require('./middlewares/playlist-from-feeder');
const playSong = require('./middlewares/play-song');
const renderSpeech = require('./middlewares/render-speech');

/**
 * High-order handler
 * for construction in-on-go intent handler
 *
 * @param playlist - storage for playlist chunk
 * @param strings - strings and configuration of handler
 * @param query - storage for search query data
 * @returns {{handler: handler}}
 */
function build ({playlist, strings, query}) {
  debug(`build handler "${strings.name}"`);

  if (!strings.slots) {
    warning('Missed slots');
  }

  if (!strings.slots) {
    warning('missed fulfillments');
  }

  /**
   * handle "in one go" action
   *
   * @param app
   * @returns {Promise.<T>}
   */
  function handler (app) {
    debug(`start handler "${strings.name}"`);
    const slotScheme = strings;

    // pipeline of action handling
    return copyArgumentToSlots()({app, slotScheme, playlist, query})
      .then(copyDefaultsToSlots())
      .then(feederFromSlotScheme())
      .then(playlistFromFeeder())
      .then((context) => {
        debug('got playlist');
        return parepareSongData()(context)
          .then(fulfilResolvers())
          .then(renderSpeech())
          .then(playSong());
      })
      .catch((args) => {
        debug(`we don't have playlist (or it is empty)`);
        debug(`TODO: propose user something else`);
        debug(args);
        debug(Object.keys(args));
        dialog.ask(app, {
          speech: `We haven't find anything by your request.
                   Would you like something else?`,
        });
      });
  }

  return {
    handler,
  };
}

module.exports = {
  build,
};
