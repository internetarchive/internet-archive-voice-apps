/**
 * integration tests for repeat
 */

const {expect} = require('chai');
const sinon = require('sinon');

const {buildIntentRequest, MockResponse} = require('../_utils/mocking');

let index, configStub, adminInitStub, functions, admin;

describe('integration', () => {
  before(() => {
    admin = require('firebase-admin');
    adminInitStub = sinon.stub(admin, 'initializeApp');
    functions = require('firebase-functions');
    configStub = sinon.stub(functions, 'config').returns(require(`../.runtimeconfig.json`));
    index = require('../..');
  });
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
  after(() => {
    // Restoring our stubs to the original methods.
    configStub.restore();
    adminInitStub.restore();
  });
});
