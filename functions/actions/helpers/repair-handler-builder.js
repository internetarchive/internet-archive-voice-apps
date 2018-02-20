const dialog = require('../../dialog');
const {getLastReprompt, getLastSuggestions} = require('../../state/dialog');
const {getLastAction, getLastRepetitionCount} = require('../../state/repetition');

module.exports = {
  /**
   * contract common action handler
   *
   * @param actionName
   * @param intentStrings
   * @returns {function(*=)}
   */
  buildRapairHandler: (actionName, intentStrings) => {
    /**
     * handle no-input intent
     *
     * @param app
     */
    return (app) => {
      let count = 0;

      if (getLastAction(app) === actionName) {
        count = getLastRepetitionCount(app);
      }

      const suggestions = getLastSuggestions(app);

      switch (count) {
        case 0:
          dialog.ask(app, intentStrings.first, suggestions);
          break;
        case 1:
          dialog.ask(
            app,
            intentStrings.reprompt.replace('${reprompt}', getLastReprompt(app)),
            suggestions
          );
          break;
        default:
          dialog.tell(app, intentStrings.fallback);
          break;
      }
    }
  }
};
