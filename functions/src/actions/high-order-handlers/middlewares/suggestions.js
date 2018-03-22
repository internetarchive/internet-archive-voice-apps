const _ = require('lodash');
const mustache = require('mustache');

const suggestionExtensions = require('../../../extensions/suggestions');
const {debug, warning} = require('../../../utils/logger')('ia:actions:middleware:suggestions');

/**
 * Middleware
 * Fetch suggestions for slots
 *
 * @param slots
 * @param suggestionsScheme
 * @returns {Promise}
 */
module.exports = () => (args) => {
  // TODO: migrate to the `...rest` style
  // once Google Firebase migrates to modern Node.js
  debug('start');
  const {slots, suggestionsScheme} = args;
  let suggestions = suggestionsScheme.suggestions;

  if (suggestions) {
    debug('have static suggestions', suggestions);
    return Promise.resolve(
      Object.assign({}, args, {slots: Object.assign({}, slots, {suggestions})}, {suggestions})
    );
  }

  const provider = suggestionExtensions.getSuggestionProviderForSlots(suggestionsScheme.confirm);
  if (!provider) {
    warning(`don't have any suggestions for: ${suggestionsScheme.confirm}. Maybe we should add them.`);
    return Promise.resolve(args);
  }

  return provider(slots)
    .then(res => {
      let suggestions;
      if (suggestionsScheme.suggestionTemplate) {
        suggestions = res.items.map(
          item => mustache.render(suggestionsScheme.suggestionTemplate, item)
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
      return Object.assign(
        {}, args, {slots: Object.assign({}, slots, {suggestions})}, {suggestions}
      );
    });
};
