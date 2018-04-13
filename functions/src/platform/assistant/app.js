const params = require('./parameters');
const persistance = require('./persistence');
const response = require('./response');

/**
 * Facade of Actions of Google App
 */
class App {
  constructor (ctx) {
    this.ctx = ctx;

    this.platform = 'assistant';

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
    return this.ctx.getLastSeen();
  }

  /**
   * Current track offset
   *
   * for the moment Action of Google doesn't support offset
   * so it's always zero
   *
   * @returns {Number}
   */
  getOffset () {
    return 0;
  }
}

module.exports = {
  App,
};
