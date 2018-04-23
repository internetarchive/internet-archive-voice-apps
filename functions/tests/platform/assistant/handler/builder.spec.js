const {expect} = require('chai');
const sinon = require('sinon');

const assistantMock = require('../../../_utils/mocking/platforms/assistant');

const builder = require('../../../../src/platform/assistant/handler/builder');

describe('platform', () => {
  describe('assistant', () => {
    let actionsMap;
    let app;

    beforeEach(() => {
      app = assistantMock();
      actionsMap = new Map([
        ['welcome', sinon.spy],
        ['hello', sinon.spy],
      ]);
    });

    it('should populate intent handlers', () => {
      const res = builder({app, actionsMap});
      expect(res).to.have.lengthOf(2);
      expect(res[0]).to.have.property('intent', 'welcome');
      expect(res[1]).to.have.property('intent', 'hello');
    });
  });
});
