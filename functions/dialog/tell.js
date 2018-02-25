const debug = require('debug')('ia:dialog:ask:debug');

/**
 * tell to user without waiting for feedback
 *
 * @param app
 * @param speech {string}
 */
module.exports = function tell (app, {speech}) {
  debug('tell', speech);
  debug('[!] we end session');

  if (typeof app === 'string') {
    throw new Error(`Argument 'app' should be DialogflowApp object but we get ${app}`);
  }

  if (!speech) {
    throw new Error(`Argument 'speech' is not defined: ${speech}`);
  }

  app.tell(app.buildRichResponse()
    .addSimpleResponse(speech));
};
