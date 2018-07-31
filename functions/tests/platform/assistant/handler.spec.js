const {expect} = require('chai');
const rewire = require('rewire');
const sinon = require('sinon');

const handlerBuilder = rewire('../../../src/platform/assistant/handler');

const {buildIntentRequest, MockResponse} = require('../../_utils/mocking');
const {wait} = require('../../_utils/wait');

describe('platform', () => {
  describe('assistant', () => {
    let actions;
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
      actions = new Map([
        ['global-error', {default: sinon.spy()}],
        ['unhandled', {default: sinon.spy()}],
      ]);
    });

    describe('handler', () => {
      it('should warn in case of missed action', () => {
        let warning = sinon.spy();
        handlerBuilder.__set__('warning', warning);

        const handler = handlerBuilder(actions);
        const action = 'on-definitely-uncovered-action';

        handler(buildIntentRequest({
          action,
          lastSeen: null,
        }), res);

        return wait()
          .then(() => {
            expect(warning).to.be.called;
            expect(warning.getCall(0).args[0]).to.includes(action);
          });
      });

      it('should gracefully ask in case of missed action', () => {
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
            expect(res.speech()).to.includes(`Sorry, I'm afraid I don't follow you.`);
          });
      });

      [
        'global-error',
        'unhandled',
      ].forEach((action) => {
        it(`should warn in case of missed ${action} action`, () => {
          let warning = sinon.spy();
          handlerBuilder.__set__('warning', warning);
          actions.delete(action);
          handlerBuilder(actions);
          expect(warning).to.have.been.called;
        });
      });
    });
  });
});
