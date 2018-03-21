const {debug} = require('../../../utils/logger')('ia:actions:hoh:ask');
const dialog = require('../../../dialog');

/**
 * Middleware
 *
 * send ask response back to the user
 *
 * @param app
 * @param speech
 * @param suggestions
 *
 * @return {Promise}
 */
module.exports = () => (context) => {
  debug('start');

  const {app, speech, suggestions} = context;

  if (speech && speech.length > 0) {
    dialog.ask(app, {
      speech: speech.join(' '),
      suggestions: suggestions.filter(s => s).slice(0, 3),
    });
  } else {
    // TODO: we don't have anything to say should warn about it
  }

  return Promise.resolve(context);
};
