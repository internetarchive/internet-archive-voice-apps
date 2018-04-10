const sinon = require('sinon');

module.exports = ({findResult = null} = {}) => ({
  find: sinon.stub().returns(findResult),
});
