const {expect} = require('chai');
const mocking = require('./_utils/mocking');
const {buildIntentRequest, MockResponse} = require('./_utils/mocking');
const {playMedia} = require('..');

describe('playMedia', () => {
  it('should be defined', () => {
    expect(playMedia).to.be.ok;
  });

  it('should handle common intend', () => {
    playMedia(buildIntentRequest({action: 'input.welcome'}), new MockResponse());
  });
});
