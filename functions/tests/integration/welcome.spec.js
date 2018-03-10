/**
 * integration tests for repeat
 */

const {expect} = require('chai');
const sinon = require('sinon');
var index, configStub, adminInitStub, functions, admin;
const {buildIntentRequest, MockResponse} = require('../_utils/mocking');

describe('integration', () => {
  beforeEach(() => {
    admin = require('firebase-admin');
    adminInitStub = sinon.stub(admin, 'initializeApp');
    functions = require('firebase-functions');
    configStub = sinon.stub(functions, 'config').returns(require(`../.runtimeconfig.json`));
    index = require('../..');
  });
  describe('welcome', () => {
    it('should handle for a new user', () => {
      const res = new MockResponse();
      index.playMedia(buildIntentRequest({
        action: 'welcome',
        lastSeen: null,
      }), res);
      expect(res.speech()).to.not.contain('Welcome back,');
      expect(res.speech()).to.contain('Welcome to music at the Internet Archive.');
    });

    it('should handle for return user', () => {
      const res = new MockResponse();
      index.playMedia(buildIntentRequest({
        action: 'welcome',
      }), res);
      expect(res.speech()).to.contain('Welcome to music at the Internet Archive.');
    });
  });
  afterEach(() => {
    // Restoring our stubs to the original methods.
    configStub.restore();
    adminInitStub.restore();
  });
});
