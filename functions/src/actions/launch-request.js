function handler (app) {
  app.response.ask({speech: 'Hello World in Action!'});
}

module.exports = {
  handler,
};
