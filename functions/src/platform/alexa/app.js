const persistance = require('./persistence');
const response = require('./response');

/**
 * Facade of Alexa App
 */
class App {
  constructor (alexa) {
    this.alexa = alexa;

    // define interfaces
    this.persist = persistance(alexa);
    this.response = response(alexa);
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
