const { debug } = require('../../../utils/logger')('ia:platform.assistant.middlewares.log-session-duration');

module.exports = (conv) => {
  const delta = Date.now() - conv.firestore.sessionData.createdAt;
  debug(`session runs for ${delta} ms`);
};
