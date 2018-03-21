const mustache = require('mustache');
const {debug} = require('../../../utils/logger')('ia:actions:hoh:render-speech');

/**
 * Construct mustache render
 * @param slots
 */
const render = (slots) => (speech) => mustache.render(speech, slots);

/**
 * Render speech by substituting slots
 * @param slots
 * @param speech {Array|String}
 * @returns {Promise}
 */
module.exports = () => (args) => {
  debug('start');
  const {slots, speech} = args;
  if (!speech || speech.length === 0) {
    debug(`don't have speech here`);
    return Promise.resolve(args);
  } else {
    if (Array.isArray(speech)) {
      return Promise.resolve(Object.assign({}, args, {
        speech: speech.map(render(slots)),
      }));
    } else {
      return Promise.resolve(Object.assign({}, args, {
        speech: render(slots)(speech),
      }));
    }
  }
};
