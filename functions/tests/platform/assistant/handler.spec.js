const {expect} = require('chai');
const rewire = require('rewire');
const sinon = require('sinon');

const handlerBuilder = rewire('../../../src/platform/assistant/handler');

const {buildIntentRequest, MockResponse} = require('../../_utils/mocking');
const {wait} = require('../../_utils/wait');

describe('platform', () => {
  describe('assistant', () => {
    let res;
    let functions, admin;
    let configStub, adminInitStub;

    before(function () {
      this.timeout(3000);
      res = new MockResponse();
      admin = require('firebase-admin');
      adminInitStub = sinon.stub(admin, 'initializeApp');
      functions = require('firebase-functions');
      configStub = sinon.stub(functions, 'config').returns(require(`../../.runtimeconfig.json`));
    });

    after(() => {
      configStub.restore();
      adminInitStub.restore();
    });

    beforeEach(() => {
      res = new MockResponse();
    });

    describe('handler', () => {
      it('should warn in case of missed action', () => {
        let warning = sinon.spy();
        handlerBuilder.__set__('warning', warning);

        const handler = handlerBuilder();
        const action = 'on-definitely-uncovered-action';
        handler(buildIntentRequest({
          action,
          lastSeen: null,
        }), res);

        return wait()
          .then(() => {
            expect(warning.getCall(0).args[0]).to.includes(action);
            expect(warning).to.be.calledOnce;
          });
      });
    });
  });
});
