const {expect} = require('chai');
const {list} = require('../../humanize');

describe('humanize', () => {
  describe('list', () => {
    describe('toSoftString', () => {
      it('should converts a list of items to a human readable string', () => {
        expect(
          list.toFriendlyString(['A', 'B', 'C'], {ends: ' or '})
        ).to.be.equal('A, B or C');
      });
    });
  });
});
