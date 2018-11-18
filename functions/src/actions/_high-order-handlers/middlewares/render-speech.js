const mustache = require('mustache');
const { debug } = require('../../../utils/logger')('ia:actions:middlewares:render-speech');

/**
 * Construct mustache render
 * @param slots
 */
const render = (slots) => (speech) => mustache.render(speech, slots);

/**
 * Render speech by substituting slots
 * @returns {Function}
 */
module.exports = () => (ctx) => {
  debug('start');
  const { slots, reprompt, speech } = ctx;
  if (!speech || speech.length === 0) {
    debug(`don't have speech here`);
    return Promise.resolve(ctx);
  } else {
    debug('slots:', slots);
    debug('speech:', speech);
    debug('reprompt:', reprompt);
    if (Array.isArray(speech)) {
      return Promise.resolve({
        ...ctx,
        speech: speech.map(render(slots)),
        reprompt: reprompt && render(slots)(reprompt),
      });
    } else {
      return Promise.resolve({
        ...ctx,
        speech: render(slots)(speech),
        reprompt: reprompt && render(slots)(reprompt),
      });
    }
  }
};
