const {expect} = require('chai');
const rewire = require('rewire');

const coverageYear = rewire('../../../src/extensions/suggestions/coverage-year');

const mockAlbumProvider = require('../../_utils/mocking/provider/albums');

describe('suggestions', () => {
  describe('coverage & year', () => {
    let albumProvider;

    beforeEach(() => {
      albumProvider = mockAlbumProvider({
        fetchAlbumsResolve: {
          items: [{
            coverage: 'NY',
            year: 2017,
          }],
        },
      });
      coverageYear.__set__('albumsProvider', albumProvider);
    });

    it('should have slots', () => {
      expect(coverageYear).to.have.property('slots');
    });

    it('should have handler', () => {
      expect(coverageYear).to.have.property('handle');
    });

    it('should fetch popular (coverage, year) pairs', () => {
      const slots = {
        collectionId: 'etree',
        creatorId: 'band',
      };
      return coverageYear
        .handle(slots)
        .then(res => {
          expect(res).to.have.property('items').with.deep.members([{
            coverage: 'NY',
            year: 2017,
          }]);
        });
    });
  });
});
