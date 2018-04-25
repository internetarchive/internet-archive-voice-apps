const sinon = require('sinon');

module.exports = ({getByName = {}, getData = {}, offset = 0} = {}) => ({
  getOffset: sinon.stub().returns(offset),

  params: {getByName: sinon.stub().callsFake(name => getByName[name])},

  persist: {
    getData: sinon.stub().callsFake(name => getData[name]),
    setData: sinon.stub().callsFake((name, value) => {
      getData[name] = value;
      return true;
    }),
  },

  response: sinon.spy(),
});
