const {expect} = require('chai');
const strings = require('../../strings');
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
  describe('no-input', () => {
    it('should 1st time', () => {
      const res = new MockResponse();
      index.playMedia(buildIntentRequest({
        action: 'no-input',
      }), res);
      expect(res.statusCode).to.be.equal(200);
      expect(res.userResponse()).to.be.true;
      expect(res.speech()).to.contain(strings.intents.noInput[0].speech);
    });

    it('should 2nd time', () => {
      const res = new MockResponse();
      const req = buildIntentRequest({
        action: 'no-input',
        data: {
          dialog: {
            lastPhrase: {
              reprompt: 'Direction?',
            }
          },
          actions: {
            action: 'no-input',
            count: 1,
          },
        },
      });
      index.playMedia(req, res);
      expect(res.statusCode).to.be.equal(200);
      expect(res.userResponse()).to.be.true;
      expect(res.speech()).to.contain(
        strings.intents.noInput[1].speech.replace('{{reprompt}}', 'Direction?')
      );
    });

    it('should 3rd time', () => {
      const res = new MockResponse();
      const req = buildIntentRequest({
        action: 'no-input',
        data: {
          actions: {
            action: 'no-input',
            count: 2,
          },
        },
      });
      index.playMedia(req, res);
      expect(res.statusCode).to.be.equal(200);
      expect(res.userResponse()).to.be.false;
      expect(res.speech()).to.contain(strings.intents.noInput[2].speech);
    });

    it('should not fallback 3rd time if previous action was not no-input', () => {
      const res = new MockResponse();
      const req = buildIntentRequest({
        action: 'no-input',
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
      expect(res.speech()).to.contain(strings.intents.noInput[0].speech);
    });
  });
  after(() => {
    // Restoring our stubs to the original methods.
    configStub.restore();
    adminInitStub.restore();
  });
});
