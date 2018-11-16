const { buildHandler } = require('./_high-order-handlers/response-and-ask-again');
const strings = require('../strings').intents.songDetails.nothing;

module.exports = {
  handler: buildHandler(strings),
};
