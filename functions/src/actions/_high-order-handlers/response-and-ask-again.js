const selectors = require('../../configurator/selectors');
const dialog = require('../../dialog');
const { getLastPhrase } = require('../../state/dialog');
const query = require('../../state/query');

module.exports = {
  /**
   * Build response and prompt to the last question
   *
   * @param strings
   * @returns {Function}
   */
  buildHandler (strings) {
    /**
     * Intent handler
     */
    return (app) => {
      dialog.ask(app, dialog.merge(
        selectors.find(strings, query.getSlots(app)),
        getLastPhrase(app))
      );
    };
  }
};
