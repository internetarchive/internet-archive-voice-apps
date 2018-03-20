const _ = require('lodash');
const mustache = require('mustache');

const selectors = require('../configurator/selectors');
const dialog = require('../dialog');
const feeders = require('../extensions/feeders');
const {getSuggestionProviderForSlots} = require('../extensions/suggestions');
const {
  getPromptsForSlots,
} = require('../slots/slots-of-template');
const playlist = require('../state/playlist');
const query = require('../state/query');
const availableSchemes = require('../strings').intents.musicQuery;
const {debug, warning} = require('../utils/logger')('ia:actions:music-query');

const fulfilResolvers = require('./high-order-handlers/middlewares/fulfil-resolvers');

/**
 * Handle music query action
 * - fill slots of music query
 * - call fulfilment feeder
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

  const answer = [];

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

  processPreset(app, slotScheme);

  const complete = query.hasSlots(app, slotScheme.slots);
  if (complete) {
    debug('we got all needed slots');
    const feeder = feeders.getByName(slotScheme.fulfillment);
    if (!feeder) {
      // TODO: we should softly fallback here
      warning(`we need feeder "${slotScheme.fulfillment}" for fulfillment slot dialog`);
      return Promise.resolve();
    } else {
      playlist.setFeeder(app, slotScheme.fulfillment);
      return feeder
        .build({app, query, playlist})
        .then(() => {
          if (feeder.isEmpty({app, query, playlist})) {
            // TODO: feeder can't find anything by music query
            // isn't covered case should be implemented
            dialog.ask(
              `We haven't find anything by your request would you like something else?`
            );
          } else {
            dialog.playSong(app, feeder.getCurrentItem({app, query, playlist}));
          }
        });
    }
  }

  const slots = query.getSlots(app);
  debug('we had slots:', Object.keys(slots));

  return generateAcknowledge({app, slots, slotScheme, newValues})
    .then(fulfilResolvers())
    .then(renderSpeech())
    .then(res => {
      answer.push(res);
      return generatePrompt({app, slotScheme});
    })
    .then(fulfilResolvers())
    .then(renderSpeech())
    .then(res => {
      answer.push(res);

      const groupedAnswers = groupAnswers(answer);
      if (groupedAnswers.speech && groupedAnswers.speech.length > 0) {
        dialog.ask(app, {
          speech: groupedAnswers.speech.join(' '),
          suggestions: groupedAnswers.suggestions.filter(s => s).slice(0, 3),
        });
      } else {
        // TODO: we don't have anything to say should warn about it
      }
    });
}

/**
 * Render speech and substitute slots
 */
const renderSpeech = () => (args) => {
  const {slots, speech} = args;
  if (!speech) {
    return args;
  } else {
    return Object.assign({}, args, {
      speech: mustache.render(speech, slots),
    });
  }
};

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
function processPreset (app, slotScheme) {
  const name = app.getArgument('preset');
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
 * Squeeze array of answer in the single object of arrays
 *
 * @param {Array} answer
 * @returns {Object}
 */
function groupAnswers (answer) {
  return answer
  // skip empty responses
    .filter(a => a)
    // squeeze fields of answers in the single object
    .reduce(
      (acc, value) =>
        // get each new value ...
        Object.keys(value)
          .reduce(
            (acc, newKey) =>
              // and patch initial object with it
              Object.assign(acc, {
                [newKey]: (acc[newKey] || []).concat(value[newKey]),
              }),
            acc),
      {}
    );
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
      const value = app.getArgument(slotName);
      if (value) {
        query.setSlot(app, slotName, value);
        newValues[slotName] = value;
      }
      return newValues;
    }, {});
}

/**
 * Generate acknowledge message for received values
 *
 * @param app
 * @param newValues
 * @returns {*}
 */
function generateAcknowledge (args) {
  const {slotScheme, newValues} = args;
  const newNames = Object.keys(newValues);

  // we get new values
  if (newNames.length === 0) {
    debug(`we don't get any new values`);
    return Promise.resolve(args);
  }

  debug('and get new slots:', newValues);

  const template = selectors.find(slotScheme.acknowledges, {
    prioritySlots: newNames,
  });

  if (!template) {
    debug(`we haven't found right acknowledge maybe we should create few for "${newNames}"`);
    return Promise.resolve(args);
  }

  debug('we got matched acknowledge', template);

  return Promise.resolve(Object.assign({}, args, {speech: template}));
}

/**
 * Middleware
 * Fetch suggestions for slots
 *
 * @param app
 * @param promptScheme
 * @returns {Promise}
 */
function fetchSuggestions (args) {
  // TODO: migrate to the `...rest` style
  // once Google Firebase migrates to modern Nodej.s
  const {app, promptScheme} = args;
  let suggestions = promptScheme.suggestions;

  if (suggestions) {
    debug('have static suggestions', suggestions);
    return Promise.resolve(Object.assign({}, args, {suggestions}));
  }

  const provider = getSuggestionProviderForSlots(promptScheme.requirements);
  if (!provider) {
    warning(`don't have any suggestions for: ${promptScheme.requirements}. Maybe we should add them.`);
    return Promise.resolve(args);
  }

  return provider(query.getSlots(app))
    .then(res => {
      let suggestions;
      if (promptScheme.suggestionTemplate) {
        suggestions = res.items.map(
          item => mustache.render(promptScheme.suggestionTemplate, item)
        );
      } else {
        suggestions = res.items.map(
          item => {
            if (typeof item === 'object') {
              return _.values(item).join(' ');
            } else {
              return item;
            }
          }
        );
      }
      return Object.assign({}, args, {suggestions});
    });
}

/**
 * Generate prompt for missed slots
 *
 * @param app
 * @param slotScheme
 * @returns {*}
 */
function generatePrompt (args) {
  const {app, slotScheme} = args;
  const missedSlots = slotScheme.slots
    .filter(slotName => !query.hasSlot(app, slotName));

  if (missedSlots.length === 0) {
    debug(`we don't have any missed slots`);
    return Promise.resolve(args);
  }

  debug('we missed slots:', missedSlots);
  const promptScheme = getPromptsForSlots(
    slotScheme.prompts,
    missedSlots
  );

  if (!promptScheme) {
    warning(`we don't have any matched prompts`);
    return Promise.resolve(args);
  }

  const template = _.sample(promptScheme.prompts);
  debug('we randomly choice prompt:', template);

  return fetchSuggestions({app, promptScheme})
    .then((res) => {
      const suggestions = res.suggestions;
      const slots = Object.assign({}, query.getSlots(app), {suggestions});
      return Promise.resolve({slots, speech: template, suggestions});
    });
}

module.exports = {
  handler,
  fetchSuggestions,
};
