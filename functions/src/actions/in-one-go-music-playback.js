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
const feederFromSlotScheme = require('./_middlewares/feeder-from-slots-scheme');
const findRepairPhrase = require('./_middlewares/find-repair-phrase');
const findRepairScheme = require('./_middlewares/find-repair-scheme');
const fulfilResolvers = require('./_middlewares/fulfil-resolvers');
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
  return copyArgumentToSlots()({ app, slotScheme, playlist, query })
    .then(copyDefaultsToSlots())
    // expose slots
    .then(ctx => Object.assign({}, ctx, { slots: ctx.query.getSlots(ctx.app) }))
    // expose current platform to the slots
    .then(ctx =>
      Object.assign({}, ctx, {
        slots: Object.assign(
          {}, ctx.slots, { platform: app.platform || 'assistant' }
        )
      })
    )
    .then(feederFromSlotScheme())
    .then(playlistFromFeeder())
    .then(acknowledge({ speeches: 'slotScheme.fulfillment.speech' }))
    .then(mapSongDataToSlots())
    .then(fulfilResolvers())
    .then(renderSpeech())
    .then(playSong())
    .catch((error) => {
      debug(`we don't have playlist (or it is empty)`);

      if (error instanceof errors.HTTPError) {
        // don't handle http error here
        // because we are handling it on upper level
        return Promise.reject(error);
      }

      const context = error.context;
      const brokenSlots = context ? context.newValues : {};
      const slots = context ? context.slots : {};

      // we shouldn't exclude collections and creators
      // because without them we would have too broad scope
      const exclude = Object.keys(brokenSlots)
        // .filter(name => ['collectionId', 'creator'].indexOf(name) < 0);
        .filter(name => ['collectionId'].indexOf(name) < 0);

      fsm.transitionTo(app, constants.fsm.states.SEARCH_MUSIC);

      return Promise.resolve(Object.assign({}, context, {
        brokenSlots,
        // drop any acknowledges before
        speech: [],
        suggestions: [],
        slots: Object.assign({}, slots, {
          suggestions: [],
        }),
      }))
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
