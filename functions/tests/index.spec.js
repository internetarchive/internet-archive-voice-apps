const rewire = require('rewire');

const {expect} = require('chai');
const sinon = require('sinon');
const {buildIntentRequest, MockResponse} = require('./_utils/mocking');
const index = rewire('..');

describe('playMedia', () => {
  it('should be defined', () => {
    expect(index.playMedia).to.be.ok;
  });

  it('should handle welcome action', () => {
    const WelcomeHandler = sinon.spy();
    index.__set__('Welcome', WelcomeHandler);
    index.playMedia(buildIntentRequest({action: 'input.welcome'}), new MockResponse());
    expect(WelcomeHandler).to.have.been.calledOnce;
  });
});
