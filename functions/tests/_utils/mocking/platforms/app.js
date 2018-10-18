const sinon = require('sinon');

module.exports = ({ getByName = {}, getData = {}, getRequestError = {}, isNewSession = false, offset = 0, platform = 'assistant' } = {}) => ({
  getOffset: sinon.stub().returns(offset),

  getRequestError: sinon.stub().returns(getRequestError),

  isNewSession: sinon.stub().returns(isNewSession),

  params: { getByName: sinon.stub().callsFake(name => getByName[name]) },

  platform,

  persist: {
    dropAll: sinon.stub().callsFake(() => {
      getData = {};
    }),
    getData: sinon.stub().callsFake(name => getData[name]),
    setData: sinon.stub().callsFake((name, value) => {
      getData[name] = value;
      return true;
    }),
  },

  response: sinon.spy(),
});
