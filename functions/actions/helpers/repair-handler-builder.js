const dialog = require('../../dialog');
const {getLastAction, getLastRepetitionCount} = require('../../state/actions');
const {getLastReprompt, getLastSuggestions} = require('../../state/dialog');

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
      let count = 1;

      if (getLastAction(app) === actionName) {
        count = getLastRepetitionCount(app);
      }

      const reprompt = getLastReprompt(app);
      const suggestions = getLastSuggestions(app);

      switch (count) {
        case 1:
          dialog.ask(
            app,
            {
              speech: intentStrings.first,
              reprompt: reprompt,
              suggestions: suggestions,
            }
          );
          break;
        case 2:
          dialog.ask(
            app,
            {
              speech: intentStrings.reprompt.replace('${reprompt}', reprompt),
              reprompt,
              suggestions,
            }
          );
          break;
        default:
          dialog.tell(app, {speech: intentStrings.fallback});
          break;
      }
    }
  }
};
