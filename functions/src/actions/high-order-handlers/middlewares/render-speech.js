const mustache = require('mustache');
const {debug} = require('../../../utils/logger')('ia:actions:render-speech');

/**
 * Render speech by substituting slots
 * @param slots
 * @param speech
 * @returns {Promise}
 */
module.exports = () => (args) => {
  debug('start');
  const {slots, speech} = args;
  if (!speech) {
    debug(`don't have speech here`);
    return args;
  } else {
    return Promise.resolve(Object.assign({}, args, {
      speech: mustache.render(speech, slots),
    }));
  }
};
