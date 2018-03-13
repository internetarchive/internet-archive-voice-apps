const {expect} = require('chai');

const resolver = require('../../../../slots/extensions/resolvers/alias');

describe('extensions', () => {
  describe('resolvers', () => {
    describe('alias', () => {
      it('should match alias for collectionId', () => {
        return resolver
          .handler({
            collectionId: 'etree'
          })
          .then(res => {
            expect(res.collectionId).to.be.equal('live concerts');
          });
      });
    });
  });
});
