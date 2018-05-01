const mustache = require('mustache');

const selectors = require('../../../configurator/selectors');
const playback = require('../../../state/playback');
const availableStrings = require('../../../strings').dialog.playSong;
const esapceHTMLObject = require('../../../utils/escape-html-object');
const {debug} = require('../../../utils/logger')('ia:actions:middlewares:song-data');

/**
 * Get songs data from feeder and them to slots
 */
module.exports = () => (args) => {
  debug('start');
  let {app, feeder, slots = {}, speech = []} = args;
  const songData = feeder.getCurrentItem(args);
  const mute = playback.isMuteSpeechBeforePlayback(app);

  slots = Object.assign({}, slots, esapceHTMLObject(songData));

  const strings = selectors.find(availableStrings, slots);

  // TODO: maybe it would be better to use mustache later
  // with resolvers and render-speech
  const description = mustache.render(strings.description, slots);

  if (mute) {
    const wordless = selectors.find(strings.wordless, slots);
    if (wordless && wordless.speech) {
      speech = [].concat(speech, wordless.speech);
    }
  } else {
    speech = [].concat(speech, description);
  }

  return Promise.resolve(Object.assign({},
    args,
    {
      slots,
      speech,
      description,
    }));
};
