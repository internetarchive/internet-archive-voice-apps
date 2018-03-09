const _ = require('lodash');
const mustache = require('mustache');

const dialog = require('../dialog');
const welcomeStrings = require('../strings').intents.welcome;

/**
 * handle welcome intent
 *
 * @param app
 */
function handler (app) {
  let reprompt = mustache.render(welcomeStrings.reprompt, welcomeStrings);

  let speech;
  if (app.getLastSeen() === null) {
    speech = '<speak> <audio src="https://s3.amazonaws.com/gratefulerrorlogs/CrowdNoise.mp3" />' + _.sample(welcomeStrings.acknowledges) + ' ' + welcomeStrings.speech + '</speak>';
  } else {
    speech = _.sample(welcomeStrings.acknowledges) + ' ' + welcomeStrings.speech;
  }

  dialog.ask(app, Object.assign({}, welcomeStrings, {speech, reprompt}));
}

module.exports = {
  handler,
};
