const sinon = require('sinon');

module.exports = ({processOptionsReturns = {}} = {}) => ({
  ask: sinon.spy(),
  playSong: sinon.spy(),
  processOptions: sinon.stub().returns(processOptionsReturns),
  tell: sinon.spy(),
});
