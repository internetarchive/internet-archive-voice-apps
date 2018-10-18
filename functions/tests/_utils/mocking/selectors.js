const sinon = require('sinon');

module.exports = ({ findResult = null } = {}) => {
  const find = sinon.stub();
  if (Array.isArray(findResult)) {
    findResult.forEach((res, i) => find.onCall(i).returns(res));
  } else {
    find.returns(findResult);
  }
  return {
    find,
  };
};
