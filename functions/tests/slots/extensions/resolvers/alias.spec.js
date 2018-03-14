const {expect} = require('chai');

const resolver = require('../../../../src/slots/extensions/resolvers/alias');

describe('extensions', () => {
  describe('resolvers', () => {
    describe('alias', () => {
      it('should match alias for collectionId', () => {
        return resolver
          .handler({
            collectionId: 'etree'
          })
          .then(res => {
            expect(res.collectionId).to.be.equal('Live Concerts');
          });
      });
    });
  });
});
