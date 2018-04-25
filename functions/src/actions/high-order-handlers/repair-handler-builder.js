const mustache = require('mustache');

const dialog = require('../../dialog');
const {getLastAction, getLastRepetitionCount} = require('../../state/actions');
const {getLastReprompt, getLastSuggestions} = require('../../state/dialog');
const {debug} = require('../../utils/logger')('ia:actions:high-order-handlers:repair-handler-builder');

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
        debug('repetition count', count);
      } else {
        debug('we got it 1st time');
      }

      const reprompt = getLastReprompt(app);
      debug('reprompt', reprompt);

      const suggestions = getLastSuggestions(app);
      debug('suggestions', suggestions);

      switch (count) {
        case 1:
          dialog.ask(
            app, Object.assign({}, intentStrings[0], {
              reprompt,
              suggestions,
            })
          );
          break;
        case 2:
          dialog.ask(
            app,
            {
              speech: mustache.render(
                intentStrings[1].speech,
                {reprompt}
              ),
              reprompt,
              suggestions,
            }
          );
          break;
        default:
          dialog.tell(app, intentStrings[2]);
          break;
      }
    };
  }
};
