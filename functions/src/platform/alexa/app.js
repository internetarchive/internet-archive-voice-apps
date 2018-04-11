const persistance = require('./persistence');
const params = require('./parameters');
const response = require('./response');

/**
 * Facade of Alexa App
 */
class App {
  constructor (ctx) {
    this.ctx = ctx;

    // define interfaces
    this.params = params(ctx);
    this.persist = persistance(ctx);
    this.platform = 'alexa';
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
}

module.exports = {
  App,
};
