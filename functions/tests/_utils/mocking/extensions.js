const sinon = require('sinon');

module.exports = (extensions) => ({
  getByName: sinon.stub().callsFake(name => extensions[name]),
});
