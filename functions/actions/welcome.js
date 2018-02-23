const dialog = require('../dialog');
const intentStrings = require('../strings').intents.welcome;

/**
 * handle welcome intent
 *
 * @param app
 */
function handler (app) {
  // init(app);
  // askAudio(app, "Test Song", "https://ia802307.us.archive.org/20/items/gd73-06-10.sbd.hollister.174.sbeok.shnf/RFKJune73extras/Booklet/center_vbr.mp3", suggestions);

  // let cardTitle = 'Welcome';
  let repromptText = '<speak>Waiting for your response. <break time=".2s"/> Would you like to listen to music from our collections of 78s or Live Concerts?</speak>';
  // let cardOutput = 'Welcome to the live music collection at the Internet Archive. What artist would you like to listen to? For example The Ditty Bops, The Grateful Dead or The Cowboy Junkies.';
  let speechOutput = '<audio src="https://s3.amazonaws.com/gratefulerrorlogs/CrowdNoise.mp3" />  Welcome to music at the Internet Archive. Would you like to listen to music from our collections of 78s or Live Concerts?';
  // let speechOutput = "<speak>Welcome to the live music collection at the Internet Archive.<break time='.5s'/> What artist would you like to listen to? <break time='.5s'/>  For example, the ditty bops, the grateful dead, or the cowboy junkies. </speak>";

  if (app.getLastSeen() !== null) {
    speechOutput = 'Welcome back, Would you like to listen to music from our collections of 78s or Live Concerts?';
  }

  dialog.ask(app, speechOutput, repromptText, intentStrings.suggestions);
}

module.exports = {
  handler,
};
