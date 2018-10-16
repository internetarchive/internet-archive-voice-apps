const sinon = require('sinon');

module.exports = ({getByNameReturn = null} = {}) => ({
  getByName: sinon.stub().returns(getByNameReturn),
});
