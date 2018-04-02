const {expect} = require('chai');
const rewire = require('rewire');
const sinon = require('sinon');

const {buildIntentRequest, MockResponse} = require('./_utils/mocking');

let index, configStub, adminInitStub, functions, admin;

describe('assistant', () => {
  let res;

  before(function () {
    this.timeout(3000);
    admin = require('firebase-admin');
    adminInitStub = sinon.stub(admin, 'initializeApp');
    functions = require('firebase-functions');
    configStub = sinon.stub(functions, 'config').returns(require(`./.runtimeconfig.json`));
    index = rewire('..');
  });

  beforeEach(() => {
    res = new MockResponse();
  });

  it('should be defined', () => {
    expect(index.assistant).to.be.ok;
  });

  it('should store last used action', () => {
    index.assistant(buildIntentRequest({
      action: 'welcome',
      lastSeen: null,
    }), res);
    expect(res.data()).to.have.property('actions').to.have.property('action', 'welcome');
  });

  after(() => {
    // Restoring our stubs to the original methods.
    configStub.restore();
    adminInitStub.restore();
  });
});
