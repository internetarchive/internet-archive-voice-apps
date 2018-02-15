const {expect} = require('chai');
const {buildIntentRequest, MockResponse} = require('./_utils/mocking');
const index = require('..');

describe('playMedia', () => {
  it('should be defined', () => {
    expect(index.playMedia).to.be.ok;
  });

  it('should handle welcome action', () => {
    const res = new MockResponse();
    index.playMedia(buildIntentRequest({action: 'input.welcome'}), res);
    expect(res.speech()).to.contain('Welcome back, choose an artist.');
  });
});
