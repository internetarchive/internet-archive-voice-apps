const dialog = require('../../../dialog');
const {debug} = require('../../../utils/logger')('ia:actions:middlewares:song-data');

/**
 * Play song which described in slots
 * speeach and description are used
 * to give additional description of song
 */
module.exports = () => (args) => {
  debug('start');
  const {app} = args;
  return dialog.playSong(app, Object.assign(
    {}, args.slots, {speech: args.speech, descripion: args.description}
  ));
};
