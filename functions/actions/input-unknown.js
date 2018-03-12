const intentStrings = require('../strings').intents.unknown;
const {actionNameByFileName} = require('./helpers/handlers');
const {buildRapairHandler} = require('./high-order-handlers/repair-handler-builder');

module.exports = {
  /**
   * handle no-input intent
   *
   * @param app
   */
  handler: buildRapairHandler(
    actionNameByFileName(__filename),
    intentStrings
  ),
};
