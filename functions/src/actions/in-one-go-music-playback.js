const playlist = require('../state/playlist');
const query = require('../state/query');
const strings = require('../strings').intents.inOneGoMusicPlayback;

const { debug } = require('../utils/logger')('ia:actions:in-one-go-music-playback');

const constants = require('../constants');
const errors = require('../errors');
const fsm = require('../state/fsm');

const acknowledge = require('./_middlewares/acknowledge');
const ask = require('./_middlewares/ask');
const copyArgumentToSlots = require('./_middlewares/copy-arguments-to-slots');
const copyDefaultsToSlots = require('./_middlewares/copy-defaults-to-slots');
const copySlotsToQuerySlots = require('./_middlewares/copy-slots-to-query-store');
const feederFromSlotScheme = require('./_middlewares/feeder-from-slots-scheme');
const findRepairPhrase = require('./_middlewares/find-repair-phrase');
const findRepairScheme = require('./_middlewares/find-repair-scheme');
const fulfilResolvers = require('./_middlewares/fulfil-resolvers');
const mapPlatformToSlots = require('./_middlewares/map-platform-to-slots');
const mapSlotValues = require('./_middlewares/map-slot-values');
const { mapSongDataToSlots } = require('./_middlewares/song-data');
const playlistFromFeeder = require('./_middlewares/playlist-from-feeder');
const playSong = require('./_middlewares/play-song');
const renderSpeech = require('./_middlewares/render-speech');
const suggestions = require('./_middlewares/suggestions');

/**
 * handle "in one go" action
 *
 * @param app
 * @returns {Promise.<T>}
 */
function handler (app) {
  debug(`start handler "${strings.name}"`);
  const slotScheme = strings;

  if (app.isNewSession()) {
    // this action is exposed outside as in-one-go-action
    // so for Alexa we should clean its attributes
    debug(`it is new session we should drop all sessions's attributes`);
    app.persist.dropAll();
  }

  // pipeline of action handling
  // @deprecated: should remove playlist and query
  // but some other modules could use them
  return Promise.resolve({ app, slotScheme, playlist, query })
    .then(copyArgumentToSlots())
    .then(mapSlotValues())
    .then(copySlotsToQuerySlots())
    .then(copyDefaultsToSlots())
    // set slots variable
    .then(ctx => ({ ...ctx, slots: query.getSlots(ctx.app) }))
    // expose current platform to the slots
    .then(mapPlatformToSlots())
    .then(feederFromSlotScheme())
    .then(playlistFromFeeder())
    .then(acknowledge({ speeches: 'slotScheme.fulfillment.speech' }))
    .then(mapSongDataToSlots())
    .then(fulfilResolvers())
    .then(renderSpeech())
    .then(playSong())
    .catch((error) => {
      debug(`we don't have playlist (or it is empty)`);
      debug(error);

      if (error instanceof errors.HTTPError) {
        // don't handle http error here
        // because we are handling it on upper level
        return Promise.reject(error);
      }

      const ctx = error.context;
      const brokenSlots = ctx ? ctx.newValues : {};
      const slots = ctx ? ctx.slots : {};

      // we shouldn't exclude collections and creators
      // because without them we would have too broad scope
      const exclude = Object.keys(brokenSlots)
      // .filter(name => ['collectionId', 'creator'].indexOf(name) < 0);
        .filter(name => ['collectionId'].indexOf(name) < 0);

      fsm.transitionTo(app, constants.fsm.states.SEARCH_MUSIC);

      return Promise.resolve({
        ...ctx,
        brokenSlots,
        // drop any acknowledges before
        speech: [],
        suggestions: [],
        slots: {
          ...slots,
          suggestions: [],
        },
      })
        .then(findRepairScheme())
        .then(suggestions({ exclude }))
        .then(findRepairPhrase())
        .then(fulfilResolvers())
        .then(renderSpeech())
        // TODO: should clean broken slots from queue state
        .then(ask());
    });
}

module.exports = {
  handler,
};
