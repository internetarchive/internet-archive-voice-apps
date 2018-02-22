const _ = require('lodash');
const sinon = require('sinon');

/**
 * mock assistant app
 *
 * @returns {{}}
 */
module.exports = function mockApp ({lastSeen = Date.now()} = {}) {
  const app = {};
  app.ask = sinon.stub().returns(app);
  app.data = {};
  _.set(app, 'Media.ImageType.LARGE', 'Media.ImageType.LARGE');
  app.addMediaObjects = sinon.stub().returns(app);
  app.addMediaResponse = sinon.stub().returns(app);
  app.addSimpleResponse = sinon.stub().returns(app);
  app.addSuggestionLink = sinon.stub().returns(app);
  app.addSuggestions = sinon.stub().returns(app);
  app.buildMediaObject = sinon.stub().returns(app);
  app.buildMediaResponse = sinon.stub().returns(app);
  app.buildRichResponse = sinon.stub().returns(app);
  app.getLastSeen = sinon.stub().returns(lastSeen);
  app.setImage = sinon.stub().returns(app);
  app.setDescription = sinon.stub().returns(app);
  return app;
};
