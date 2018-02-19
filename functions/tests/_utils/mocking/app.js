const sinon = require('sinon');

/**
 * mock assistant app
 *
 * @returns {{}}
 */
module.exports = function mockApp ({lastSeen = Date.now()} = {}) {
  const app = {};
  app.ask = sinon.stub().returns(app);
  app.addSimpleResponse = sinon.stub().returns(app);
  app.addSuggestions = sinon.stub().returns(app);
  app.buildRichResponse = sinon.stub().returns(app);
  app.data = {};
  app.getLastSeen = sinon.stub().returns(lastSeen);
  return app;
};
