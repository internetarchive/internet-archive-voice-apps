const debug = require('debug')('ia:actions:music-query:debug');
const warning = require('debug')('ia:actions:music-query:warning');
const _ = require('lodash');
const mustache = require('mustache');

const dialog = require('../dialog');
const humanize = require('../humanize');
const {
  extractRequrements,
  getMatchedTemplates,
  getMatchedTemplatesExactly,
  getPromptsForSlots,
  getRequiredExtensionHandlers,
} = require('../slots/slots-of-template');
const {getSuggestionProviderForSlots} = require('../slots/suggestions');
const playlist = require('../state/playlist');
const querySlots = require('../state/query');
const queryDialogScheme = require('../strings').intents.musicQuery;

const fulfillments = require('../slots/fulfillments');

/**
 * handle music query action
 * - fill slots of music query
 * TODO: it seems we could use express.js/koa middleware architecture here
 *
 * @param app
 */
function handler (app) {
  debug('Start music query handler');

  const answer = [];
  const newValues = fillSlots(app);

  const complete = querySlots.hasSlots(app, Object.keys(queryDialogScheme.slots));
  if (complete) {
    debug('we got all needed slots');
    const feeder = fulfillments.getByName(queryDialogScheme.fulfillment);
    return feeder
      .build(querySlots, playlist)
      .then(() => {
        if (feeder.isEmpty(querySlots, playlist)) {
          // TODO: feeder can't find anything by music query
          // isn't covered case should be implemented
          dialog.ask(
            `We haven't find anything by your request would you like something else?`
          );
        } else {
          dialog.playSong(app, feeder.getCurrentItem(querySlots, playlist));
        }
      });
  }

  return generateAcknowledge(app, newValues)
    .then(res => {
      answer.push(res);
      return generatePrompt(app);
    })
    .then(res => {
      answer.push(res);

      const groupedAnswers = groupAnswers(answer);
      if (groupedAnswers.speech.length > 0) {
        dialog.ask(app, {
          speech: groupedAnswers.speech.join(' '),
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

  for (let slotName in queryDialogScheme.slots) {
    const value = app.getArgument(slotName);
    if (value) {
      querySlots.setSlot(app, slotName, value);
      newValues[slotName] = value;
    }
  }

  return newValues;
}

/**
 * Generate acknowledge message for received values
 *
 * @param app
 * @param newValues
 * @returns {*}
 */
function generateAcknowledge (app, newValues) {
  const newNames = Object.keys(newValues);
  // we get new values
  if (newNames.length === 0) {
    debug(`we don't get any new values`);
    return Promise.resolve(null);
  }

  debug('We get few new slots', newValues);

  const acknowledgeRequirements = extractRequrements(queryDialogScheme.acknowledges);

  // find the list of acknowledges which match recieved slots
  let validAcknowledges = getMatchedTemplatesExactly(
    acknowledgeRequirements,
    newNames
  );

  if (validAcknowledges.length === 0) {
    validAcknowledges = getMatchedTemplates(
      acknowledgeRequirements,
      newNames
    );
  }

  if (validAcknowledges.length === 0) {
    warning(`there is no valid acknowledges for ${newNames}. Maybe we should write few?`);
    return Promise.resolve(null);
  }

  debug('we have few valid acknowledges', validAcknowledges);

  const template = _.sample(validAcknowledges);
  const context = querySlots.getSlots(app);

  // mustachejs doesn't support promises on-fly
  // so we should solve all them before and fetch needed data
  return resolveSlots(context, template)
    .then(resolvedSlots => ({
      speech: mustache.render(
        template,
        Object.assign({}, newValues, resolvedSlots)
      )
    }));
}

/**
 * Resolve all template slots which refers to extensions
 *
 * some slots could be resolved in more friendly look
 * for example we could convert creatorId to {title: <band-name>}
 *
 * @param context
 * @param template
 * @returns {Promise.<TResult>}
 */
function resolveSlots (context, template) {
  const extensions = getRequiredExtensionHandlers(template);
  return Promise
    .all(
      extensions
        .map(({handler}) => handler(context))
    )
    .then(solutions => {
      return solutions
      // zip/merge to collections
        .map((res, index) => {
          const extension = extensions[index];
          return Object.assign({}, extension, {result: res});
        })
        // pack result in the way:
        // [__<extension_type>].[<extension_name>] = result
        .reduce((acc, extension) => {
          return Object.assign({}, acc, {
            ['__' + extension.extType]: {
              [extension.name]: extension.result,
            },
          });
        }, {});
    });
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
    Object.keys(queryDialogScheme.slots)
      .filter(slotName => !querySlots.hasSlot(app, slotName));

  if (missedSlots.length === 0) {
    debug(`we don't have any missed slots`);
    return Promise.resolve(null);
  }

  debug('we missed slots:', missedSlots);
  const promptScheme = getPromptsForSlots(
    queryDialogScheme.prompts,
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
          values: suggestions,
        },
      });

      return Promise.resolve({speech, suggestions});
    });
}

module.exports = {
  handler,
};
