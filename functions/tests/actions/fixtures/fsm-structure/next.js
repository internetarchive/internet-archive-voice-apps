const sinon = require('sinon');

let build = sinon.stub();
build = build.returns(build);

module.exports = {
  handler: () => {
  },
  build
};
