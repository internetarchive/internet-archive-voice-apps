const dialog = require('../dialog');
const intentStrings = require('../strings').intents;
const greetingStrings = require('../strings').statements.greeting;
const suggestionStrings = require('../strings').suggestion;
const fallbackStrings = require('../strings').fallback;

/**
 * handle welcome intent
 *
 * @param app
 */
function handler (app) {
  // init(app);
  // askAudio(app, "Test Song", "https://ia802307.us.archive.org/20/items/gd73-06-10.sbd.hollister.174.sbeok.shnf/RFKJune73extras/Booklet/center_vbr.mp3", suggestions);

  // let cardTitle = 'Welcome';
  let reprompt = fallbackStrings.didntCatchThat + ' ' + intentStrings.welcome;
  // let cardOutput = 'Welcome to the live music collection at the Internet Archive. What artist would you like to listen to? For example The Ditty Bops, The Grateful Dead or The Cowboy Junkies.';
  let speech = '<speak> <audio src="https://s3.amazonaws.com/gratefulerrorlogs/CrowdNoise.mp3" />' + greetingStrings.welcome.liveMusicCollection + ' ' + intentStrings.welcome + '</speak>';
  // let speechOutput = "<speak>Welcome to the live music collection at the Internet Archive.<break time='.5s'/> What artist would you like to listen to? <break time='.5s'/>  For example, the ditty bops, the grateful dead, or the cowboy junkies. </speak>";

  if (app.getLastSeen() !== null) {
    speech = greetingStrings.welcomeBack + ' ' + intentStrings.welcome;
  }

  const suggestions = suggestionStrings.welcome;

  dialog.ask(app, {speech, reprompt, suggestions});
}

module.exports = {
  handler,
};
