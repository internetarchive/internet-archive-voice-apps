const { debug, error } = require('../../utils/logger/index')('ia:actions:hoh:ask');
const dialog = require('../../dialog/index');
const strings = require('../../strings');

/**
 * Middleware
 *
 * send ask response back to the user
 * - response is mandatory, and even when we have nothing to say
 * (what actualy looks like a bug)
 * we should give response to user.
 *
 * @param app
 * @param speech
 * @param suggestions
 *
 * @return {Promise}
 */
module.exports = () => (ctx) => {
  debug('start');

  const { app, reprompt, speech, suggestions } = ctx;

  if (speech && speech.length > 0) {
    dialog.ask(app, {
      speech: speech.join(' '),
      suggestions: suggestions && suggestions.filter(s => s).slice(0, 3),
      reprompt,
    });
  } else {
    error(`hm... we don't have anything to say.`);
    dialog.ask(app, strings.events.nothingToSay);
  }

  return Promise.resolve(ctx);
};
