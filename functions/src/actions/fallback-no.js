const exist = require('./exit');

/**
 * Handle Alexa Amazon.CancelIntent
 * Assistant doesn't touch this event
 * cancel and exist are synonymous intents
 *
 * @type {{handler: handler}}
 */
module.exports = {
  handler: exist.handler,
};
