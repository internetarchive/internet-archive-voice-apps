const {expect} = require('chai');

const resolver = require('../../../../slots/extensions/resolvers/humanized');

describe('extensions', () => {
  describe('resolvers', () => {
    describe('humanized', () => {
      it('should humanize suggestions', () => {
        const suggestions = [
          1970,
          1980,
          1990,
        ];
        expect(resolver.handler({
          suggestions
        }).suggestions).to.be.equal('1970, 1980 and 1990');
      });
    });
  });
});
