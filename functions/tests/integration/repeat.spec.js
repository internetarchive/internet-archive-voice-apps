/**
 * integration tests for repeat
 */

const {expect} = require('chai');
const {buildIntentRequest, MockResponse} = require('../_utils/mocking');
const index = require('../..');

describe('integration', () => {
  describe('repeat', () => {
    it('should repeat last ask', () => {
      const res = new MockResponse();
      const req = buildIntentRequest({
        action: 'repeat',
        data: {
          dialog: {
            lastPhrase: {
              speech: 'Where to go?',
              reprompt: 'Direction?',
              suggestions: ['east', 'west'],
            },
          },
        },
      });
      index.playMedia(req, res);
      expect(res.statusCode).to.be.equal(200);
      expect(res.userResponse()).to.be.true;
      expect(res.speech()).to.contain('Where to go?');
      expect(res.suggestions()).to.include.members(['east', 'west']);
    });
  });
});
