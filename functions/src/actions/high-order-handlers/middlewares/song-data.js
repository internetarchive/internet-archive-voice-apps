const mustache = require('mustache');

const selectors = require('../../../configurator/selectors');
const playback = require('../../../state/playback');
const availableStrings = require('../../../strings').dialog.playSong;
const {debug} = require('../../../utils/logger')('ia:actions:middlewares:song-data');

/**
 * Get songs data from feeder and them to slots
 */
module.exports = () => (args) => {
  debug('start');
  const {app, feeder, slots = {}, speech = []} = args;
  const songData = feeder.getCurrentItem(args);
  const mute = playback.isMuteSpeechBeforePlayback(app);
  const strings = selectors.find(availableStrings, songData);

  // TODO: maybe it would be better to use mustache later
  // with resolvers and render-speech
  const description = mustache.render(strings.description, songData);

  return Promise.resolve(Object.assign({},
    args,
    {slots: Object.assign({}, slots, songData)},
    {
      speech: [].concat(speech, mute ? strings.speech : description),
      description,
    }));
};
