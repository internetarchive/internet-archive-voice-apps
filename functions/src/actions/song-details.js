const { buildHandler } = require('./_high-order-handlers/response-and-ask-again');
const strings = require('../strings').intents.songsDetails.nothing;

module.exports = {
  handler: buildHandler(strings),
};
