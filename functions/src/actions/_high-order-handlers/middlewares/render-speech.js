const mustache = require('mustache');
const { debug } = require('../../../utils/logger')('ia:actions:middlewares:render-speech');

/**
 * Construct mustache render
 * @param slots
 */
const render = (slots) => (speech) => mustache.render(speech, slots);

/**
 * Render speech by substituting slots
 * @param slots
 * @param reprompt
 * @param speech {Array|String}
 * @returns {Promise}
 */
module.exports = () => (args) => {
  debug('start');
  const { slots, reprompt, speech } = args;
  if (!speech || speech.length === 0) {
    debug(`don't have speech here`);
    return Promise.resolve(args);
  } else {
    debug('slots:', slots);
    debug('speech', speech);
    debug('reprompt', reprompt);
    if (Array.isArray(speech)) {
      return Promise.resolve(Object.assign({}, args, {
        speech: speech.map(render(slots)),
        reprompt: reprompt && render(slots)(reprompt),
      }));
    } else {
      return Promise.resolve(Object.assign({}, args, {
        speech: render(slots)(speech),
        reprompt: reprompt && render(slots)(reprompt),
      }));
    }
  }
};
