const sinon = require('sinon');

module.exports = () => ({
  ask: sinon.spy(),
  song: sinon.spy(),
  tell: sinon.spy(),
});
