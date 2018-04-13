const params = require('./parameters');
const persistance = require('./persistence');
const response = require('./response');

/**
 * Facade of Alexa App
 */
class App {
  constructor (ctx) {
    this.ctx = ctx;

    this.platform = 'alexa';

    // define interfaces
    this.params = params(ctx);
    this.persist = persistance(ctx);
    this.response = response(ctx);
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
}

module.exports = {
  App,
};
