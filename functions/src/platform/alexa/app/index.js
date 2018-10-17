const _ = require('lodash');

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
  constructor (handlerInput, persistentAttributes) {
    this.handlerInput = handlerInput;

    this.platform = 'alexa';

    // define interfaces
    this.params = params(handlerInput);
    this.persist = persistance(handlerInput, persistentAttributes);
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
   * is it new speech session
   */
  isNewSession () {
    return _.get(this, 'handlerInput.requestEnvelope.session.new');
  }

  /**
   * Current track offset
   *
   * @returns {Number}
   */
  getOffset () {
    return this.handlerInput.requestEnvelope.request.offsetInMilliseconds;
  }

  /**
   * return error passed from Alexa with request
   */
  getRequestError () {
    return this.handlerInput.requestEnvelope.request.error;
  }

  /**
   * Stop track playback
   */
  stopPlayback () {
    debug('stop playing music');
    this.handlerInput.responseBuilder
      .withShouldEndSession(true)
      .addAudioPlayerStopDirective();
  }
}

module.exports = {
  App,
};
