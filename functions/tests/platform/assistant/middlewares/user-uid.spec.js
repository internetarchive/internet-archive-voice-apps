const { expect } = require('chai');
const _ = require('lodash');

const mockApp = require('../../../_utils/mocking/platforms/assistant');
const middleware = require('../../../../src/platform/assistant/middlewares/user-uid');

describe('platform', () => {
  describe('assistant', () => {
    describe('middlewares', () => {
      describe('user-uid', () => {
        describe('user, storage', () => {
          it('should not create new user if we already have it', () => {
            const convOld = { user: {} };
            const newConv = { ...convOld };
            middleware(newConv);
            expect(convOld.user).to.be.equal(newConv.user);
          });

          it('should not create new user\'s storage if we already have it', () => {
            const convOld = { user: { storage: {} } };
            const newConv = { ...convOld };
            middleware(newConv);
            expect(convOld.user.storage).to.be.equal(newConv.user.storage);
          });
        });

        describe('userId', () => {
          it('should create new unique user id if it was not there before', () => {
            const conv = {};
            middleware(conv);
            expect(conv).to.have.property('user')
              .which.have.property('storage')
              .which.have.property('userId');
          });

          it('should not create new id if we already have it', () => {
            const conv = { user: { storage: { userId: '123456789' } } };
            middleware(conv);
            expect(conv).to.have.property('user')
              .which.have.property('storage')
              .which.have.property('userId', '123456789');
          });
        });

        describe('sessionId', () => {
          it('should create new unique session id if it was not there before', () => {
            const conv = {};
            middleware(conv);
            expect(conv).to.have.property('user')
              .which.have.property('storage')
              .which.have.property('sessionId');
          });

          it('should not create new id we in conversation', () => {
            const conv = mockApp();
            middleware(conv);
            const previousSessionId = conv.user.storage.sessionId;

            _.set(conv, 'request.conversation.type', 'ACTIVE');

            middleware(conv);
            expect(conv).to.have.property('user')
              .which.have.property('storage')
              .which.have.property('sessionId', previousSessionId);
          });

          it('should start new session when we got new conversation', () => {
            const conv = mockApp();
            middleware(conv);
            const previousSessionId = conv.user.storage.sessionId;

            _.set(conv, 'request.conversation.type', 'NEW');

            middleware(conv);
            expect(conv).to.have.property('user')
              .which.have.property('storage')
              .which.have.property('sessionId')
              .which.not.equal(previousSessionId);
          });
        });
      });
    });
  });
});
