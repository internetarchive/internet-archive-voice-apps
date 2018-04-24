const _ = require('lodash');
const sinon = require('sinon');

/**
 * mock assistant app
 *
 * @returns {{}}
 */
module.exports = function mockApp ({
  argument = null,
  lastSeen = Date.now(),
  isFirstTry = false,
} = {}) {
  const app = {};
  app.ask = sinon.stub().returns(app);
  app.close = sinon.stub().returns(app);

  _.set(app, 'user.storage', {});
  _.set(app, 'Media.ImageType.LARGE', 'Media.ImageType.LARGE');
  _.set(app, 'MEDIA_STATUS.extension.status', null);
  _.set(app, 'Media.Status.FINISHED', 'Media.Status.FINISHED');

  if (argument && typeof argument === 'object') {
    app.parameters = argument;
  } else {
    app.parameters = argument || app.MEDIA_STATUS;
  }

  app.addMediaObjects = sinon.stub().returns(app);
  app.addMediaResponse = sinon.stub().returns(app);
  app.addSimpleResponse = sinon.stub().returns(app);
  app.addSuggestionLink = sinon.stub().returns(app);
  app.addSuggestions = sinon.stub().returns(app);
  app.buildMediaObject = sinon.stub().returns(app);
  app.buildMediaResponse = sinon.stub().returns(app);
  app.buildRichResponse = sinon.stub().returns(app);
  app.getLastSeen = sinon.stub().returns(lastSeen);
  app.intent = sinon.spy();
  app.isFirstTry = sinon.stub().returns(isFirstTry);
  app.setImage = sinon.stub().returns(app);
  app.setDescription = sinon.stub().returns(app);
  return app;
};
