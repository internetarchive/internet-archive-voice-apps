const {expect} = require('chai');

const resolver = require('../../../../src/slots/extensions/resolvers/short-options');

describe('extensions', () => {
  describe('resolvers', () => {
    describe('short options list', () => {
      it('should humanize suggestions', () => {
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
    });
  });
});
