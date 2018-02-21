/**
 * integration tests for repeat
 */

const {expect} = require('chai');
const index = require('../..');
const strings = require('../../strings');
const {buildIntentRequest, MockResponse} = require('../_utils/mocking');


describe('integration', () => {
  describe('input.unknown', () => {
    it('should 1st time', () => {
      const res = new MockResponse();
      index.playMedia(buildIntentRequest({
        action: 'input.unknown',
      }), res);
      expect(res.statusCode).to.be.equal(200);
      expect(res.userResponse()).to.be.true;
      expect(res.speech()).to.contain(strings.intents.unknown.first);
    });

    it('should 2nd time', () => {
      const res = new MockResponse();
      const req = buildIntentRequest({
        action: 'input.unknown',
        data: {
          dialog: {
            lastPhrase: {
              reprompt: 'Direction?',
            }
          },
          repetition: {
            action: 'input.unknown',
            count: 1,
          },
        },
      });
      index.playMedia(req, res);
      expect(res.statusCode).to.be.equal(200);
      expect(res.userResponse()).to.be.true;
      expect(res.speech()).to.contain(
        strings.intents.unknown.reprompt.replace('${reprompt}', 'Direction?')
      );
    });

    it('should 3rd time', () => {
      const res = new MockResponse();
      const req = buildIntentRequest({
        action: 'input.unknown',
        data: {
          repetition: {
            action: 'input.unknown',
            count: 2,
          },
        },
      });
      index.playMedia(req, res);
      expect(res.statusCode).to.be.equal(200);
      expect(res.userResponse()).to.be.false;
      expect(res.speech()).to.contain(strings.intents.unknown.fallback);
    });

    it('should not fallback 3rd time if previous action was not no-input', () => {
      const res = new MockResponse();
      const req = buildIntentRequest({
        action: 'input.unknown',
        data: {
          repetition: {
            action: 'some.other.action',
            count: 2,
          },
        },
      });
      index.playMedia(req, res);
      expect(res.statusCode).to.be.equal(200);
      expect(res.userResponse()).to.be.true;
      expect(res.speech()).to.contain(strings.intents.unknown.first);
    });
  });
});
