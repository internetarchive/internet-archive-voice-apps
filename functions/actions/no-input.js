const intentStrings = require('../strings').intents.noInput;
const {buildRapairHandler} = require('./helpers/repair-handler-builder');
const {actionNameByFileName} = require('./helpers/handlers');

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
