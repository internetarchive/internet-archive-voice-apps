const _ = require('lodash');

/**
 * Merge speech schemes
 *
 * @param args
 * @returns {*}
 */
module.exports = (...args) => args.filter(i => !!i).reduce(
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
