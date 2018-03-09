/**
 * integration tests for repeat
 */

const {expect} = require('chai');
const mustache = require('mustache');
const strings = require('../../strings');
const sinon = require('sinon');
const {buildIntentRequest, MockResponse} = require('../_utils/mocking');
var index, configStub, adminInitStub, functions, admin;

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
  describe('input-unknown', () => {
    it('should 1st time', () => {
      const res = new MockResponse();
      index.playMedia(buildIntentRequest({
        action: 'input-unknown',
      }), res);
      expect(res.statusCode).to.be.equal(200);
      expect(res.userResponse()).to.be.true;
      expect(res.speech()).to.contain(strings.intents.unknown[0].speech);
    });

    it('should 2nd time', () => {
      const res = new MockResponse();
      const req = buildIntentRequest({
        action: 'input-unknown',
        data: {
          dialog: {
            lastPhrase: {
              reprompt: 'Direction?',
            }
          },
          actions: {
            action: 'input-unknown',
            count: 1,
          },
        },
      });
      index.playMedia(req, res);
      expect(res.statusCode).to.be.equal(200);
      expect(res.userResponse()).to.be.true;
      expect(res.speech()).to.contain(
        mustache.render(
          strings.intents.unknown[1].speech,
          { reprompt: 'Direction?' }
        )
      );
    });

    it('should 3rd time', () => {
      const res = new MockResponse();
      const req = buildIntentRequest({
        action: 'input-unknown',
        data: {
          actions: {
            action: 'input-unknown',
            count: 2,
          },
        },
      });
      index.playMedia(req, res);
      expect(res.statusCode).to.be.equal(200);
      expect(res.userResponse()).to.be.false;
      expect(res.speech()).to.contain(strings.intents.unknown[2].speech);
    });

    it('should not fallback 3rd time if previous action was not no-input', () => {
      const res = new MockResponse();
      const req = buildIntentRequest({
        action: 'input-unknown',
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
      expect(res.speech()).to.contain(strings.intents.unknown[0].speech);
    });
  });
  after(() => {
    // Restoring our stubs to the original methods.
    configStub.restore();
    adminInitStub.restore();
  });
});
