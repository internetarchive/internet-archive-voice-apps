const {expect} = require('chai');

const resolver = require('../../../../src/slots/extensions/resolvers/years-interval');

describe('extensions', () => {
  describe('resolvers', () => {
    describe('interval', () => {
      it('should give options when it less of equal 3', () => {
        const suggestions = [
          1970,
          1980,
          1990,
        ];

        return resolver
          .handler({
            suggestions
          })
          .then(res => {
            expect(res.suggestions).to.be.equal('1970, 1980 or 1990');
          });
      });

      it('should give min max interval when we have more than 3 options', () => {
        const suggestions = [
          1970,
          1980,
          1990,
          2000,
        ];

        return resolver
          .handler({
            suggestions
          })
          .then(res => {
            expect(res.suggestions).to.be.equal('between 1970 and 2000');
          });
      });
    });
  });
});
