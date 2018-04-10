const sinon = require('sinon');

module.exports = ({getByName = {}, getData = {}}) => ({
  params: {getByName: sinon.stub().callsFake(name => getByName[name])},
  persist: {
    getData: sinon.stub().callsFake(name => getData[name]),
    setData: sinon.spy(),
  }
});
