const _ = require('lodash');

const dialog = require('../dialog');
const query = require('../state/query');
const welcomeStrings = require('../strings').intents.welcome;

/**
 * handle welcome intent
 *
 * @param app
 */
function handler (app) {
  let reprompt = welcomeStrings.reprompt || welcomeStrings.speech;

  let speech;
  if (app.isFirstTry && app.isFirstTry()) {
    speech = '<audio src="https://s3.amazonaws.com/gratefulerrorlogs/CrowdNoise.mp3" />' + _.sample(welcomeStrings.acknowledges) + ' ' + welcomeStrings.speech;
  } else {
    speech = _.sample(welcomeStrings.acknowledges) + ' ' + welcomeStrings.speech;
  }

  query.resetSlots(app);
  dialog.ask(app, Object.assign({}, welcomeStrings, {speech, reprompt}));
}

module.exports = {
  handler,
};
