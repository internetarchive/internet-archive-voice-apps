const {debug} = require('../../../utils/logger')('ia:platform:alexa:app');

const params = require('../parameters');
const persistance = require('../persistence');
const response = require('../response');

/**
 * Facade of Alexa App
 */
class App {
  /**
   * Create instance of Alexa App
   *
   * @param handlerInput
   */
  constructor (handlerInput) {
    this.handlerInput = handlerInput;

    this.platform = 'alexa';

    // define interfaces
    this.params = params(handlerInput);
    this.persist = persistance(handlerInput);
    this.response = response(handlerInput);
  }

  /**
   * is first skill used time
   *
   * @returns {boolean}
   */
  isFirstTry () {
    return true;
  }

  /**
   * Current track offset
   *
   * @returns {Number}
   */
  getOffset () {
    return this.handlerInput.request.offsetInMilliseconds;
  }

  /**
   * Stop track playback
   */
  stopPlayback () {
    debug('stop playing music');
    this.handlerInput.responseBuilder.addAudioPlayerStopDirective();
  }
}

module.exports = {
  App,
};
