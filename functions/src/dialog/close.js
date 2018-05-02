const {debug} = require('../utils/logger')('ia:dialog:tell');

/**
 * tell to user without waiting for feedback
 * (close session)
 *
 * @param app
 * @param speech {string}
 */
module.exports = function close (app, {speech}) {
  debug('tell', speech);

  if (typeof app === 'string') {
    throw new Error(`Argument 'app' should be DialogflowApp object but we get ${app}`);
  }

  if (!speech) {
    throw new Error(`Argument 'speech' is not defined: ${speech}`);
  }

  app.response({close: true, speech});
};
