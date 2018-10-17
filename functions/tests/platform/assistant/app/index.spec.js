const { expect } = require('chai');

const app = require('../../../../src/platform/assistant/app');

const convOfNewSession = require('./fixtures/conv-of-new-session.json');
const convOfActiveSession = require('./fixtures/conv-of-active-session.json');

describe('platform', () => {
  describe('assistant', () => {
    describe('isNewSession', () => {
      it('should return true if it is new session', () => {
        const a = new app.App(convOfNewSession);
        expect(a.isNewSession()).to.be.true;
      });

      it('should return true if it in not new session', () => {
        const a = new app.App(convOfActiveSession);
        expect(a.isNewSession()).to.be.false;
      });
    });
  });
});
