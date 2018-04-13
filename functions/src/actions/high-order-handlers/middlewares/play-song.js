const dialog = require('../../../dialog');
const {debug} = require('../../../utils/logger')('ia:actions:middlewares:song-data');

/**
 * Play song which described in slots
 * speeach and description are used
 * to give additional description of song
 *
 * @param mediaResponseOnly {boolean} we should return media response only
 */
module.exports = ({mediaResponseOnly = false} = {}) => (context) => {
  debug('start');
  const {app} = context;
  dialog.playSong(app, Object.assign(
    {}, context.slots, {
      mediaResponseOnly,
      speech: context.speech.join(' '),
      description: context.description,
    }
  ));
  return Promise.resolve();
};
