const intentStrings = require('../strings').intents.unknown;
const {buildRapairHandler} = require('./helpers/repair-handler-builder');
const {actionNameByFileName} = require('./helpers/handlers');

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
