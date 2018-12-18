const selectors = require('../configurator/selectors');
const constants = require('../constants');
const errors = require('../errors');
const middlewareErrors = require('./_middlewares/errors');
const fsm = require('../state/fsm');
const playlist = require('../state/playlist');
const query = require('../state/query');
const musicQuerySchemes = require('../strings').intents.musicQuery;
const { debug, warning } = require('../utils/logger')('ia:actions:music-query');

const acknowledge = require('./_middlewares/acknowledge');
const ask = require('./_middlewares/ask');
const findRepairPhrase = require('./_middlewares/find-repair-phrase');
const findRepairScheme = require('./_middlewares/find-repair-scheme');
const fulfilResolvers = require('./_middlewares/fulfil-resolvers');
const copyArgumentsToSlots = require('./_middlewares/copy-arguments-to-slots');
const copyDefaultsToSlots = require('./_middlewares/copy-defaults-to-slots');
const copyNewValuesToQueryStore = require('./_middlewares/copy-new-values-to-query-store');
const mapPlatformToSlots = require('./_middlewares/map-platform-to-slots');
const mapSlotValues = require('./_middlewares/map-slot-values');
const renderSpeech = require('./_middlewares/render-speech');
const suggestions = require('./_middlewares/suggestions');
const prompt = require('./_middlewares/prompt');

const feederFromSlotScheme = require('./_middlewares/feeder-from-slots-scheme');
const playlistFromFeeder = require('./_middlewares/playlist-from-feeder');
const { mapSongDataToSlots } = require('./_middlewares/song-data');
const playSong = require('./_middlewares/play-song');

/**
 * Handle music query action
 * - fill slots of music query
 * - call fulfillment feeder
 *
 * TODO:
 * 1) it seems we could use express.js/koa middleware architecture here
 * 2) all that could should be builder for any slot-based actions
 * and should be placed to ./helpers.
 *
 * @param app
 * @returns {Promise}
 */
async function handler (app) {
  debug('Start music query handler');

  const { slotScheme, newValues } = await populateSlots({ app });

  await processPreset(app, slotScheme);

  const slots = query.getSlots(app);
  debug('we had slots:', Object.keys(slots));
  debug('we need slots:', slotScheme.slots);

  const complete = query.hasSlots(app, slotScheme.slots);
  if (complete) {
    debug('pipeline playback');
    return feederFromSlotScheme()({ app, newValues, playlist, slots, slotScheme, query })
    // expose current platform to the slots
      .then(mapPlatformToSlots())
      .then(playlistFromFeeder())
      .then((context) => {
        debug('got playlist');
        return acknowledge({ speeches: 'slotScheme.fulfillment.speech', prioritySlots: 'slots' })(context)
          .then(mapSongDataToSlots())
          .then(fulfilResolvers())
          .then(renderSpeech())
          .then(playSong());
      })
      .catch((error) => {
        debug(`we don't have playlist (or it is empty)`);

        let context = error;
        if (error instanceof middlewareErrors.MiddlewareError) {
          context = error.context;
          error = error.reason;
        }

        if (error instanceof errors.HTTPError) {
          // don't handle http error here
          // because we are handling it on upper level
          return Promise.reject(error);
        }

        const brokenSlots = context.newValues || {};

        fsm.transitionTo(app, constants.fsm.states.SEARCH_MUSIC);

        return Promise.resolve(Object.assign({}, context, {
          brokenSlots,
          // drop any acknowledges before
          speech: [],
        }))
          .then(findRepairScheme())
          .then(suggestions({ exclude: Object.keys(brokenSlots) }))
          .then(findRepairPhrase())
          .then(fulfilResolvers())
          .then(renderSpeech())
          // TODO: should clean broken slots from queue state
          .then(ask());
      });
  }

  fsm.transitionTo(app, constants.fsm.states.SEARCH_MUSIC);

  debug('pipeline query');
  return acknowledge()({ app, slots, slotScheme, speech: [], newValues })
    .then(prompt())
    .then(suggestions())
    .then(context => {
      if (context.suggestions && context.suggestions.length === 0) {
        // suggestions here are available range
        // when it is 0 we should later last input
        // TODO: when is is 1 we could choose this one option without asking

        // 1. find last prompt
        // 2. get repair phrase from the last prompt
        // 3. render repair phrase
        const brokenSlots = context.newValues;
        return Promise.resolve(Object.assign({}, context, {
          brokenSlots,
          // drop any acknowledges before
          speech: [],
        }))
          .then(findRepairScheme())
          .then(suggestions({ exclude: Object.keys(brokenSlots) }))
          .then(findRepairPhrase());
      }
      return context;
    })
    .then(fulfilResolvers())
    .then(renderSpeech())
    .then(ask());
}

// TODO: require refactoring
// we should put it in regular pipeline with middlewares
async function populateSlots (ctx) {
  const { app } = ctx;
  let slotScheme = selectors.find(musicQuerySchemes, query.getSlots(app));
  checkSlotScheme(slotScheme);
  ctx = { ...ctx, slotScheme };
  ctx = await copyArgumentsToSlots()(ctx);
  ctx = await mapSlotValues()(ctx);
  ctx = await copyNewValuesToQueryStore()(ctx);
  ctx = await copyDefaultsToSlots()(ctx);

  // new values could change actual slot scheme
  const newScheme = selectors.find(musicQuerySchemes, query.getSlots(app));
  if (slotScheme !== newScheme) {
    slotScheme = newScheme;
    // update slots for new scheme
    checkSlotScheme(slotScheme);
    ctx = { ...ctx, slotScheme };
    ctx = await copyArgumentsToSlots()(ctx);
    ctx = await mapSlotValues()(ctx);
    ctx = await copyNewValuesToQueryStore()(ctx);
    ctx = await copyDefaultsToSlots()(ctx);
  }
  return ctx;
}

/**
 *
 * @param slotScheme
 */
function checkSlotScheme (slotScheme) {
  if (!slotScheme) {
    throw new Error('There are no valid slot scheme. Need at least default');
  }

  if (slotScheme && slotScheme.name) {
    debug(`we are going with "${slotScheme.name}" slot scheme`);
  }
}

/**
 *
 * @param app
 * @param slotScheme
 * @param presetParamName
 */
async function processPreset (app, slotScheme, { presetParamName = 'preset' } = {}) {
  let name = app.params.getByName(presetParamName);
  if (!name) {
    debug(`it wasn't preset`);
    return;
  }

  debug(`we got preset "${name}" in "${slotScheme.name}"`);

  if (!slotScheme.presets || !(name in slotScheme.presets)) {
    warning(`but we don't have it in presets of ${slotScheme.name}`);
    return;
  }

  const preset = slotScheme.presets[name];
  if (!('defaults' in preset)) {
    warning(`but it doesn't have defaults`);
    return;
  }

  await copyDefaultsToSlots()({ app, slotScheme: preset });
}

module.exports = {
  handler,
  populateSlots,
  processPreset,
};
