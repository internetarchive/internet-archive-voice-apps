const _ = require('lodash');

/**
 * Merge speech instances
 *
 * @param args
 */
module.exports = (...args) => args.reduce(
  (acc, item) => {
    if ('speech' in item) {
      acc.speech = []
        .concat(acc.speech, item.speech)
        .filter(i => i);
    }

    if ('suggestions' in item) {
      acc.suggestions = _.union(acc.suggestions, item.suggestions);
    }

    if ('reprompt' in item) {
      acc.reprompt = item.reprompt;
    }

    return acc;
  },
  {}
);
