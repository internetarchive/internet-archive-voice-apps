const dialog = require('../../../dialog');
const fsm = require('../../../state/fsm');
const {debug} = require('../../../utils/logger')('ia:actions:middlewares:song-data');

const constants = require('../../../constants');

/**
 * Play song which described in slots
 * speeach and description are used
 * to give additional description of song
 *
 * @param mediaResponseOnly {boolean} we should return media response only
 */
module.exports = ({mediaResponseOnly = false, offset = 0} = {}) => (context) => {
  debug('start');
  const {app} = context;

  dialog.playSong(app, Object.assign(
    {}, context.slots, {
      mediaResponseOnly,
      offset,
      speech: context.speech.join(' '),
      description: context.description,
    }
  ));

  fsm.setState(app, constants.fsm.states.PLAYBACK);
  return Promise.resolve();
};
