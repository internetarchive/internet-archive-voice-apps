const intentStrings = require('../strings').intents.unknown;
const {actionNameByFileName} = require('./_helpers');
const {buildRapairHandler} = require('./_high-order-handlers/repair-handler-builder');

module.exports = {
  /**
   * handle no-input intent
   *
   * @param app
   */
  handler: buildRapairHandler(
    actionNameByFileName(__filename)[0],
    intentStrings
  ),
};
