const intentStrings = require('../strings').intents.noInput;
const {actionNameByFileName} = require('./helpers/handlers');
const {buildRapairHandler} = require('./high-order-handlers/repair-handler-builder');

module.exports = {
  /**
   * handler unknown intent
   *
   * @param app
   */
  handler: buildRapairHandler(
    actionNameByFileName(__filename),
    intentStrings
  ),
};
