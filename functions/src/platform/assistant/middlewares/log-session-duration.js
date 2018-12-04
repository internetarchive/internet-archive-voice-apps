const moment = require('moment');

const { debug } = require('../../../utils/logger')('ia:platform.assistant.middlewares.log-session-duration');

module.exports = (conv) => {
  const delta = Date.now() - conv.firestore.sessionData.createdAt;
  const timePass = moment(new Date(conv.firestore.sessionData.createdAt)).fromNow(true);
  debug(`session runs for ${timePass} / ${delta} ms`);
};
