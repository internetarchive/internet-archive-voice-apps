const {error} = require('../../../utils/logger')('ia:platform:alexa:error-handler');

/**
 * Handle error in alexa skill
 *
 * @type {{canHandle: (()=>boolean), handle: ((p1:*, p2?:*))}}
 */
module.exports = {
  /**
   * handle error for any intent
   */
  canHandle: () => true,

  /**
   * log and give answer
   *
   * @param handlerInput
   */
  handle: (handlerInput, err) => {
    error('Caught Error:', err);

    return handlerInput.responseBuilder
      .speak('Sorry, I\'m experiencing some technical difficulties at the moment. Please try again later.')
      .getResponse();
  },
};
