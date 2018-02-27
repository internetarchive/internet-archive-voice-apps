const debug = require('debug')('ia:actions:music-query:debug');
const warning = require('debug')('ia:actions:music-query:warning');
const _ = require('lodash');
const mustache = require('mustache');

const humanize = require('../humanize');

const dialog = require('../dialog');
const {
  getMatchedTemplates,
  getMatchedTemplatesExactly,
  getPromptsForSlots,
} = require('../slots/slots-of-template');
const {getSuggestionProviderForSlots} = require('../slots/suggestion-provider');
const querySlots = require('../state/query');
const intentStrings = require('../strings').intents.musicQuery;

/**
 * handle music query action
 * - fill slots of music query
 *
 * @param app
 */
function handler (app) {
  debug('Start music query handler');

  // TODO: should use resolvers here
  //
  // to fetch right name of entity
  // for example creator should be fetch by
  //
  // collection.fetchDetails(creatorId),
  //
  // and result is populated to newValue/slots?
  //
  // # Alternative:
  // fetch title on-demand -
  // for example when it is really needed for greeting generation

  const newValues = fillSlots(app);

  const answer = [];
  answer.push(generateGreeting(app, newValues));
  return generatePrompt(app)
    .then(res => {
      answer.push(res);

      const groupedAnswers = groupAnswers(answer);
      if (groupedAnswers.speech.length > 0) {
        dialog.ask(app, {
          speech: groupedAnswers.speech.join('. '),
          suggestions: groupedAnswers.suggestions,
        });
      }
    });
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
function fillSlots (app) {
  const newValues = {};

  for (let slotName in intentStrings.slots) {
    const value = app.getArgument(slotName);
    if (value) {
      querySlots.setSlot(app, slotName, value);
      newValues[slotName] = value;
    }
  }

  return newValues;
}

/**
 * Generate greeting for received values
 *
 * @param app
 * @param newValues
 * @returns {*}
 */
function generateGreeting (app, newValues) {
  const newNames = Object.keys(newValues);
  // we get new values
  if (newNames.length === 0) {
    // TODO: we don't get any new values
    debug(`we don't get any new values`);
    return null;
  }

  debug('We get few new slots', newValues);

  // find the list of greetings which match recieved slots
  let validGreetings = getMatchedTemplatesExactly(
    intentStrings.greetings,
    newNames
  );

  if (validGreetings.length === 0) {
    validGreetings = getMatchedTemplates(
      intentStrings.greetings,
      newNames
    );
  }

  if (validGreetings.length === 0) {
    warning(`there is no valid greetings for ${newNames}. Maybe we should write few?`);
    return null;
  }

  debug('we have few valid greetings', validGreetings);

  // choose one

  return {
    speech: mustache.render(_.sample(validGreetings), newValues)
  };
}

/**
 * Fetch suggestions for slots
 *
 * @param app
 * @param promptScheme
 * @returns {Promise}
 */
function fetchSuggestions (app, promptScheme) {
  let suggestions = promptScheme.suggestions;

  if (suggestions) {
    debug('have static suggestions', suggestions);
    return Promise.resolve(suggestions);
  }

  const provider = getSuggestionProviderForSlots(promptScheme.requirements);
  if (!provider) {
    warning(`don't have any suggestions for: ${promptScheme.requirements}. Maybe we should add them.`);
    return Promise.resolve(null);
  }

  return provider(querySlots.getSlots(app)).then(res => {
    const suggestions = res.items.slice(0, 3);
    if (promptScheme.suggestionTemplate) {
      return suggestions.map(
        item => mustache.render(promptScheme.suggestionTemplate, item)
      );
    } else {
      return suggestions.map(
        item => _.values(item).join(' ')
      );
    }
  });
}

/**
 * Generate prompt for missed slots
 *
 * @param app
 * @returns {*}
 */
function generatePrompt (app) {
  const missedSlots =
    Object.keys(intentStrings.slots)
      .filter(slotName => !querySlots.hasSlot(app, slotName));

  if (missedSlots.length === 0) {
    debug(`we don't have any missed slots`);
    return Promise.resolve(null);
  }

  debug('we missed slots:', missedSlots);
  const promptScheme = getPromptsForSlots(
    intentStrings.prompts,
    missedSlots
  );

  if (!promptScheme) {
    warning(`we don't have any matched prompts`);
    return Promise.resolve(null);
  }

  const prompt = _.sample(promptScheme.prompts);

  return fetchSuggestions(app, promptScheme)
    .then((suggestions) => {
      const speech = mustache.render(prompt, {
        // TODO: pass all slots and suggestions as context
        suggestions: {
          humanized: humanize.list.toFriendlyString(suggestions, {ends: ' or '}),
        },
      });

      return Promise.resolve({speech, suggestions});
    });
}

module.exports = {
  handler,
};
