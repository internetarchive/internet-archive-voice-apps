const {expect} = require('chai');
const {playMedia} = require('..');

describe('playMedia', () => {
  it('should be defined', () => {
    expect(playMedia).to.be.ok;
  });
});
