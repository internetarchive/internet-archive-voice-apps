const {expect} = require('chai');
const rewire = require('rewire');
const sinon = require('sinon');
var index, configStub, adminInitStub, functions, admin;

const {buildIntentRequest, MockResponse} = require('./_utils/mocking');

const {wait} = require('./_utils/wait');

describe('playMedia', () => {
  let res;

  before(() => {
    admin = require('firebase-admin');
    adminInitStub = sinon.stub(admin, 'initializeApp');
    // Next we stub functions.config(). Normally config values are loaded from Cloud Runtime Config;
    // here we'll just provide some fake values for firebase.databaseURL and firebase.storageBucket
    // so that an error is not thrown during admin.initializeApp's parameter check
    functions = require('firebase-functions');
    configStub = sinon.stub(functions, 'config').returns(require(`../../.runtimeconfig.json`));
    index = rewire('..');
    res = new MockResponse();
  });

  it('should be defined', () => {
    expect(index.playMedia).to.be.ok;
  });

  it('should store last used action', () => {
    index.playMedia(buildIntentRequest({
      action: 'welcome',
      lastSeen: null,
    }), res);
    expect(res.data()).to.have.property('actions').to.have.property('action', 'welcome');
  });

  it('should warn in case of missed action', () => {
    const action = 'on-definitely-uncovered-action';
    let warning = sinon.spy();
    index.__set__('warning', warning);
    index.playMedia(buildIntentRequest({
      action,
      lastSeen: null,
    }), res);

    return wait()
      .then(() => {
        expect(warning.getCall(0).args[0]).to.includes(action);
        expect(warning).to.be.calledOnce;
      });
  });
  after(() => {
    // Restoring our stubs to the original methods.
    configStub.restore();
    adminInitStub.restore();
  });
});
