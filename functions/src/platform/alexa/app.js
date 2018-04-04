const persistance = require('./persistence');
const askBuilder = require('./response/ask');

class App {
  constructor (alexa) {
    this.alexa = alexa;

    this.persist = persistance(alexa);

    this.response = {
      ask: askBuilder(alexa),
    };
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
