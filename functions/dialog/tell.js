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
  app.tell(app.buildRichResponse()
    .addSimpleResponse(speech));
};
