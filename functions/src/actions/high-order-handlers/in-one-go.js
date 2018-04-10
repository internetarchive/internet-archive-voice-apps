const {debug, warning} = require('../../utils/logger')('ia:actions:in-one-go');

const acknowledge = require('./middlewares/acknowledge');
const ask = require('./middlewares/ask');
const copyArgumentToSlots = require('./middlewares/copy-arguments-to-slots');
const copyDefaultsToSlots = require('./middlewares/copy-defaults-to-slots');
const feederFromSlotScheme = require('./middlewares/feeder-from-slots-scheme');
const fulfilResolvers = require('./middlewares/fulfil-resolvers');
const parepareSongData = require('./middlewares/song-data');
const playlistFromFeeder = require('./middlewares/playlist-from-feeder');
const playSong = require('./middlewares/play-song');
const renderSpeech = require('./middlewares/render-speech');
const repairBrokenSlots = require('./middlewares/repair-broken-slots');
const suggestions = require('./middlewares/suggestions');

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
      // expose slots
      .then(context => Object.assign({}, context, {slots: context.query.getSlots(context.app)}))
      .then(feederFromSlotScheme())
      .then(playlistFromFeeder())
      .then(acknowledge({speeches: 'slotScheme.fulfillment.speech'}))
      .then(parepareSongData())
      .then(fulfilResolvers())
      .then(renderSpeech())
      .then(playSong())
      .catch((error) => {
        debug(`we don't have playlist (or it is empty)`);
        debug('keys:', Object.keys(error));
        debug('error', error);
        const context = error.context;
        const brokenSlots = context.newValues;

        // we shouldn't exclude collections and creators
        // because without them we would have too broad scope
        const exclude = Object.keys(brokenSlots)
          // .filter(name => ['collectionId', 'creator'].indexOf(name) < 0);
          .filter(name => ['collectionId'].indexOf(name) < 0);

        return repairBrokenSlots()(Object.assign({}, context, {
          brokenSlots,
          // drop any acknowledges before
          speech: [],
          suggestions: [],
          slots: Object.assign({}, context.slots, {
            suggestions: [],
          }),
        }))
          .then(suggestions({exclude}))
          .then(fulfilResolvers())
          .then(renderSpeech())
          // TODO: should clean broken slots from queue state
          .then(ask());
      });
  }

  return {
    handler,
  };
}

module.exports = {
  build,
};
