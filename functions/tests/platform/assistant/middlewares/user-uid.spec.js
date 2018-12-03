const { expect } = require('chai');

const middleware = require('../../../../src/platform/assistant/middlewares/user-uid');

describe('platform', () => {
  describe('assistant', () => {
    describe('middlewares', () => {
      describe('user-uid', () => {
        it('should create new unique user id if it was not there before', () => {
          const conv = {};
          middleware(conv);
          expect(conv).to.have.property('user').which.have.property('userID');
        });
      });
    });
  });
});
