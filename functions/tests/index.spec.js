const {expect} = require('chai');
const rewire = require('rewire');
const sinon = require('sinon');

describe('assistant', () => {
  let index, configStub, adminInitStub, functions, admin;

  before(function () {
    this.timeout(3000);
    admin = require('firebase-admin');
    adminInitStub = sinon.stub(admin, 'initializeApp');
    functions = require('firebase-functions');
    configStub = sinon.stub(functions, 'config').returns(require(`./.runtimeconfig.json`));
    index = rewire('..');
  });

  it('should be defined', () => {
    expect(index.assistant).to.be.ok;
  });

  after(() => {
    // Restoring our stubs to the original methods.
    configStub.restore();
    adminInitStub.restore();
  });
});
