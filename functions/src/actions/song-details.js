const { buildHandler } = require('./_high-order-handlers/response-and-ask-again');
const scheme = require('../strings').intents.songDetails.default;

module.exports = {
  handler: buildHandler(scheme),
};
