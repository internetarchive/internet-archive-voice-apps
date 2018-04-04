class App {
  constructor (alexa) {
    this.alexa = alexa;

    this.response = {
      ask: require('./response/ask')(alexa),
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
