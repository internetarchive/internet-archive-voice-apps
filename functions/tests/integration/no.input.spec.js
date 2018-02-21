const {expect} = require('chai');
const index = require('../..');
const strings = require('../../strings');
const {buildIntentRequest, MockResponse} = require('../_utils/mocking');

describe('integration', () => {
  describe('no.input', () => {
    it('should 1st time', () => {
      const res = new MockResponse();
      index.playMedia(buildIntentRequest({
        action: 'no.input',
      }), res);
      expect(res.statusCode).to.be.equal(200);
      expect(res.userResponse()).to.be.true;
      expect(res.speech()).to.contain(strings.intents.noInput.first);
    });

    it('should 2nd time', () => {
      const res = new MockResponse();
      const req = buildIntentRequest({
        action: 'no.input',
        data: {
          dialog: {
            lastPhrase: {
              reprompt: 'Direction?',
            }
          },
          actions: {
            action: 'no.input',
            count: 1,
          },
        },
      });
      index.playMedia(req, res);
      expect(res.statusCode).to.be.equal(200);
      expect(res.userResponse()).to.be.true;
      expect(res.speech()).to.contain(
        strings.intents.noInput.reprompt.replace('${reprompt}', 'Direction?')
      );
    });

    it('should 3rd time', () => {
      const res = new MockResponse();
      const req = buildIntentRequest({
        action: 'no.input',
        data: {
          actions: {
            action: 'no.input',
            count: 2,
          },
        },
      });
      index.playMedia(req, res);
      expect(res.statusCode).to.be.equal(200);
      expect(res.userResponse()).to.be.false;
      expect(res.speech()).to.contain(strings.intents.noInput.fallback);
    });

    it('should not fallback 3rd time if previous action was not no-input', () => {
      const res = new MockResponse();
      const req = buildIntentRequest({
        action: 'no.input',
        data: {
          actions: {
            action: 'some.other.action',
            count: 2,
          },
        },
      });
      index.playMedia(req, res);
      expect(res.statusCode).to.be.equal(200);
      expect(res.userResponse()).to.be.true;
      expect(res.speech()).to.contain(strings.intents.noInput.first);
    });
  });
});
