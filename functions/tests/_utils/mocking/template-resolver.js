const sinon = require('sinon');

module.exports = (resolvers = []) => ({
  getTemplateResolvers: sinon.stub().returns(resolvers),
});
