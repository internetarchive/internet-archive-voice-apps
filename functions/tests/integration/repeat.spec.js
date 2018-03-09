/**
 * integration tests for repeat
 */

const {expect} = require('chai');
const {buildIntentRequest, MockResponse} = require('../_utils/mocking');
var index, configStub, adminInitStub, functions, admin;
const sinon = require('sinon');

describe('integration', () => {
  before(() => {
    admin = require('firebase-admin');
    adminInitStub = sinon.stub(admin, 'initializeApp');
    // Next we stub functions.config(). Normally config values are loaded from Cloud Runtime Config;
    // here we'll just provide some fake values for firebase.databaseURL and firebase.storageBucket
    // so that an error is not thrown during admin.initializeApp's parameter check
    functions = require('firebase-functions');
    configStub = sinon.stub(functions, 'config').returns(require(`../../../.runtimeconfig.json`));
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
