const dialog = require('../../../dialog');
const {debug} = require('../../../utils/logger')('ia:actions:middlewares:song-data');

/**
 * Play song which described in slots
 * speeach and description are used
 * to give additional description of song
 */
module.exports = () => (context) => {
  debug('start');
  const {app} = context;
  dialog.playSong(app, Object.assign(
    {}, context.slots, {
      speech: context.speech.join(' '),
      description: context.description,
    }
  ));
  return Promise.resolve();
};
