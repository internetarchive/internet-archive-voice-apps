const {expect} = require('chai');

const resolver = require('../../../src/configurator/resolvers/and-other');

describe('extensions', () => {
  describe('resolvers', () => {
    describe('and other', () => {
      it('should return single entity as it is', () => {
        const artists = [
          'Grateful Dead'
        ];

        return resolver
          .handler({
            artists
          })
          .then(res => {
            expect(res.artists).to.be.equal('Grateful Dead');
          });
      });

      it('should return single entity and other if there are more', () => {
        const artists = [
          'Claude Luter Et Ses Lorientais',
          'Pierre Merlin',
          'Claude Rabanit',
        ];

        return resolver
          .handler({
            artists
          })
          .then(res => {
            expect(res.artists).to.be.equal('Claude Luter Et Ses Lorientais and other');
          });
      });
    });
  });
});
