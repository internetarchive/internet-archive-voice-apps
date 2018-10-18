const intentStrings = require('../strings').intents.noInput;
const { actionNameByFileName } = require('./_helpers');
const { buildRapairHandler } = require('./_high-order-handlers/repair-handler-builder');

module.exports = {
  /**
   * handler unknown intent
   *
   * @param app
   */
  handler: buildRapairHandler(
    actionNameByFileName(__filename)[0],
    intentStrings
  ),
};
