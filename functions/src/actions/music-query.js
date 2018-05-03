const selectors = require('../configurator/selectors');
const constants = require('../constants');
const fsm = require('../state/fsm');
const playlist = require('../state/playlist');
const query = require('../state/query');
const availableSchemes = require('../strings').intents.musicQuery;
const {debug, warning} = require('../utils/logger')('ia:actions:music-query');

const acknowledge = require('./_high-order-handlers/middlewares/acknowledge');
const ask = require('./_high-order-handlers/middlewares/ask');
const fulfilResolvers = require('./_high-order-handlers/middlewares/fulfil-resolvers');
const renderSpeech = require('./_high-order-handlers/middlewares/render-speech');
const repairBrokenSlots = require('./_high-order-handlers/middlewares/repair-broken-slots');
const suggestions = require('./_high-order-handlers/middlewares/suggestions');
const prompt = require('./_high-order-handlers/middlewares/prompt');

const feederFromSlotScheme = require('./_high-order-handlers/middlewares/feeder-from-slots-scheme');
const parepareSongData = require('./_high-order-handlers/middlewares/song-data');
const playlistFromFeeder = require('./_high-order-handlers/middlewares/playlist-from-feeder');
const playSong = require('./_high-order-handlers/middlewares/play-song');

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

  const {slotScheme, newValues} = populateSlots(app);

  processPreset(app, slotScheme);

  const slots = query.getSlots(app);
  debug('we had slots:', Object.keys(slots));

  const complete = query.hasSlots(app, slotScheme.slots);
  if (complete) {
    debug('pipeline playback');
    return feederFromSlotScheme()({app, newValues, playlist, slots, slotScheme, query})
      // expose current platform to the slots
      .then(ctx =>
        Object.assign({}, ctx, {
          slots: Object.assign(
            {}, ctx.slots, {platform: app.platform || 'assistant'}
          )
        })
      )
      .then(playlistFromFeeder())
      .then((context) => {
        debug('got playlist');
        return acknowledge({speeches: 'slotScheme.fulfillment.speech', prioritySlots: 'slots'})(context)
          .then(parepareSongData())
          .then(fulfilResolvers())
          .then(renderSpeech())
          .then(playSong());
      })
      .catch((context) => {
        debug(`we don't have playlist (or it is empty)`);
        const brokenSlots = context.newValues || {};

        fsm.transitionTo(app, constants.fsm.states.SEARCH_MUSIC);

        return repairBrokenSlots()(Object.assign({}, context, {
          brokenSlots,
          // drop any acknowledges before
          speech: [],
        }))
          .then(suggestions({exclude: Object.keys(brokenSlots)}))
          .then(fulfilResolvers())
          .then(renderSpeech())
          // TODO: should clean broken slots from queue state
          .then(ask());
      });
  }

  fsm.transitionTo(app, constants.fsm.states.SEARCH_MUSIC);

  debug('pipeline query');
  return acknowledge()({app, slots, slotScheme, speech: [], newValues})
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
        return repairBrokenSlots()(Object.assign({}, context, {
          brokenSlots,
          // drop any acknowledges before
          speech: [],
        }))
          .then(suggestions({exclude: Object.keys(brokenSlots)}));
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
  let newValues = fillSlots(app, slotScheme);
  applyDefaultSlots(app, slotScheme.defaults);

  // new values could change actual slot scheme
  const newScheme = selectors.find(availableSchemes, query.getSlots(app));
  if (slotScheme !== newScheme) {
    slotScheme = newScheme;
    // update slots for new scheme
    checkSlotScheme(slotScheme);
    newValues = Object.assign({}, newValues, fillSlots(app, slotScheme));
    applyDefaultSlots(app, slotScheme.defaults);
  }
  return {slotScheme, newValues};
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
 */
function processPreset (app, slotScheme, {presetParamName = 'preset'} = {}) {
  let name;
  if (app.getArgument) {
    // @deprecated
    name = app.getArgument('preset');
  } else {
    name = app.params.getByName(presetParamName);
  }
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
 * @returns {{}}
 */
function fillSlots (app, slotScheme) {
  return slotScheme.slots
    .reduce((newValues, slotName) => {
      let value;
      if (app.getArgument) {
        // @deprecated
        value = app.getArgument(slotName);
      } else {
        value = app.params.getByName(slotName);
      }
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
