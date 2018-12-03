const { expect } = require('chai');

const middleware = require('../../../../src/platform/assistant/middlewares/user-uid');

describe('platform', () => {
  describe('assistant', () => {
    describe('middlewares', () => {
      describe('user-uid', () => {
        it('should create new unique user id if it was not there before', () => {
          const conv = {};
          middleware(conv);
          expect(conv).to.have.property('user')
            .which.have.property('storage')
            .which.have.property('userID');
        });

        it('should not create new id if we already have it', () => {
          const conv = { user: { storage: { userID: '123456789' } } };
          middleware(conv);
          expect(conv).to.have.property('user')
            .which.have.property('storage')
            .which.have.property('userID', '123456789');
        });

        it('should not create new user if we already have it', () => {
          const convOld = { user: {} };
          const newConv = { ...convOld };
          middleware(newConv);
          expect(convOld.user).to.be.equal(newConv.user);
        });

        it(`should not create new user's storage if we already have it`, () => {
          const convOld = { user: { storage: {} } };
          const newConv = { ...convOld };
          middleware(newConv);
          expect(convOld.user.storage).to.be.equal(newConv.user.storage);
        });
      });
    });
  });
});
