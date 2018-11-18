const dialog = require('../../../dialog');
const fsm = require('../../../state/fsm');
const { debug } = require('../../../utils/logger')('ia:actions:middlewares:play-song');

const constants = require('../../../constants');

/**
 * Play song which described in slots
 * speeach and description are used
 * to give additional description of song
 *
 * @param {boolean} mediaResponseOnly we should return media response only
 * @param {int} offset
 * @returns {function(*): *}
 */
module.exports = ({ mediaResponseOnly = false, offset = 0 } = {}) => (ctx) => {
  debug('start');

  const { app, slots } = ctx;

  dialog.playSong(app, {
    ...slots,
    mediaResponseOnly,
    offset,
    speech: ctx.speech.join(' '),
    description: ctx.description,
  });

  fsm.transitionTo(app, constants.fsm.states.PLAYBACK);
  return Promise.resolve();
};
