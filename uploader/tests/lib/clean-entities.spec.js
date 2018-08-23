const {expect} = require('chai');

const clean = require('../../lib/clean-entities');

describe('clean entities', () => {
  describe('strip brackets', () => {
    it('should drop brackets', () => {
      expect(clean.dropBrackets('Amelia (Vol. 2)')).to.be.equal('Amelia Vol. 2');
    });
  });
});
