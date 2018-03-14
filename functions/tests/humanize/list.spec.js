const {expect} = require('chai');

const {list} = require('../../src/humanize');

describe('humanize', () => {
  describe('list', () => {
    describe('toSoftString', () => {
      it('should converts a array of items to a human readable string', () => {
        expect(
          list.toFriendlyString(['A', 'B', 'C'], {ends: ' or '})
        ).to.be.equal('A, B or C');
      });

      it('should return empty string for empty array', () => {
        expect(
          list.toFriendlyString()
        ).to.be.equal('');
      });
    });
  });
});
