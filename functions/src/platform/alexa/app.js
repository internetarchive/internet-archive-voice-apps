const {debug} = require('../../utils/logger')('ia:platform:alexa:app');

const params = require('./parameters');
const persistance = require('./persistence');
const response = require('./response');

/**
 * Facade of Alexa App
 */
class App {
  constructor (ctx, handlerInput) {
    this.ctx = ctx;
    this.handlerInput = handlerInput;

    this.platform = 'alexa';

    // define interfaces
    this.params = params(ctx, handlerInput);
    this.persist = persistance(ctx, handlerInput);
    this.response = response(ctx, handlerInput);
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
    return this.ctx.event.request.offsetInMilliseconds;
  }

  /**
   * Stop track playback
   */
  stopPlayback () {
    debug('stop playing music');
    this.ctx.response.audioPlayerStop();
  }
}

module.exports = {
  App,
};
