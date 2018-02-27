/**
 * integration tests for repeat
 */

const {expect} = require('chai');
const index = require('../..');
const {buildIntentRequest, MockResponse} = require('../_utils/mocking');


describe('integration', () => {
  describe('unknown', () => {
    it('should handle for a new user', () => {
      const res = new MockResponse();
      index.playMedia(buildIntentRequest({
        action: 'welcome',
        lastSeen: null,
      }), res);
      expect(res.speech()).to.not.contain('Welcome back,');
      expect(res.speech()).to.contain('Welcome to the live music collection at the Internet Archive.');
    });

    it('should handle for return user', () => {
      const res = new MockResponse();
      index.playMedia(buildIntentRequest({
        action: 'welcome',
      }), res);
      expect(res.speech()).to.contain('Welcome to the live music collection at the Internet Archive.');
    });
  });
});
