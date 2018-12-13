const selectors = require('../configurator/selectors');
const constants = require('../constants');
const errors = require('../errors');
const middlewareErrors = require('./_middlewares/errors');
const fsm = require('../state/fsm');
const playlist = require('../state/playlist');
const query = require('../state/query');
const availableSchemes = require('../strings').intents.musicQuery;
const { debug, warning } = require('../utils/logger')('ia:actions:music-query');

const acknowledge = require('./_middlewares/acknowledge');
const ask = require('./_middlewares/ask');
const findRepairPhrase = require('./_middlewares/find-repair-phrase');
const findRepairScheme = require('./_middlewares/find-repair-scheme');
const fulfilResolvers = require('./_middlewares/fulfil-resolvers');
const mapPlatformToSlots = require('./_middlewares/map-platform-to-slots');
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
function handler (app) {
  debug('Start music query handler');

  const { slotScheme, newValues } = populateSlots(app);

  processPreset(app, slotScheme);

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

function populateSlots (app) {
  let slotScheme = selectors.find(availableSchemes, query.getSlots(app));
  checkSlotScheme(slotScheme);
  let newValues = copyArgumentsToSlots(app, slotScheme);
  applyDefaultSlots(app, slotScheme.defaults);

  // new values could change actual slot scheme
  const newScheme = selectors.find(availableSchemes, query.getSlots(app));
  if (slotScheme !== newScheme) {
    slotScheme = newScheme;
    // update slots for new scheme
    checkSlotScheme(slotScheme);
    newValues = Object.assign({}, newValues, copyArgumentsToSlots(app, slotScheme));
    applyDefaultSlots(app, slotScheme.defaults);
  }
  return { slotScheme, newValues };
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
 * Apply default slots from slotsScheme
 *
 * @param app
 * @param defaults
 */
function applyDefaultSlots (app, defaults) {
  if (!defaults) {
    return;
  }

  const appliedDefaults = Object.keys(defaults)
    .filter(defaultSlotName => !query.hasSlot(app, defaultSlotName))
    .map(defaultSlotName => {
      const value = defaults[defaultSlotName];
      if (value.skip) {
        query.skipSlot(app, defaultSlotName);
      } else {
        query.setSlot(
          app,
          defaultSlotName,
          defaults[defaultSlotName]
        );
      }

      return defaultSlotName;
    });

  debug('We have used defaults:', appliedDefaults);
}

/**
 *
 * @param app
 * @param slotScheme
 * @param presetParamName
 */
function processPreset (app, slotScheme, { presetParamName = 'preset' } = {}) {
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

  applyDefaultSlots(app, preset.defaults);
}

/**
 * Put all received values to slots
 * and return list of new values
 *
 * @param app
 * @param slotScheme
 * @returns {{}}
 */
function copyArgumentsToSlots (app, slotScheme) {
  return slotScheme.slots
    .reduce((newValues, slotName) => {
      let value = app.params.getByName(slotName);
      if (value) {
        query.setSlot(app, slotName, value);
        newValues[slotName] = value;
      }
      return newValues;
    }, {});
}

module.exports = {
  handler,
  populateSlots,
  processPreset,
};
