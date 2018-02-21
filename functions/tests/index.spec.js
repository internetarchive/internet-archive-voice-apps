const {expect} = require('chai');
const {buildIntentRequest, MockResponse} = require('./_utils/mocking');
const index = require('..');
const strings = require('../strings');

describe('playMedia', () => {
  it('should be defined', () => {
    expect(index.playMedia).to.be.ok;
  });

  it('should store last used action', () => {
    const res = new MockResponse();
    index.playMedia(buildIntentRequest({
      action: 'welcome',
      lastSeen: null,
    }), res);
    expect(res.data()).to.have.property('actions').to.have.property('action', 'welcome');
  });
});
