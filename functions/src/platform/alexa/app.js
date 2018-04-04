class App {
  constructor (alexa) {
    this.alexa = alexa;

    this.response = {
      ask: require('./response/ask')(alexa),
    };
  }
}

module.exports = {
  App,
};
