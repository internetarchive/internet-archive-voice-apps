const sinon = require('sinon');

module.exports = () => ({
  ask: sinon.spy(),
  tell: sinon.spy(),
});
