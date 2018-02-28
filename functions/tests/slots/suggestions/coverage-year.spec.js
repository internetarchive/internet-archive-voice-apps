const {expect} = require('chai');
const rewire = require('rewire');

const mockCreatorProvider = require('../../_utils/mocking/provider/creator');

const coverageYear = rewire('../../../slots/suggestions/coverage-year');

describe('suggestions', () => {
  describe('coverage & year', () => {
    let creator = mockCreatorProvider({
      fetchAlbumsResolve: {
        items: [{
          coverage: 'NY',
          year: 2017,
        }],
      },
    });

    beforeEach(() => {
      coverageYear.__set__('creator', creator);
    });

    it('should have slots', () => {
      expect(coverageYear).to.have.property('slots');
    });

    it('should have handler', () => {
      expect(coverageYear).to.have.property('handler');
    });

    it('should ...', () => {
      const slots = {
        collectionId: 'etree',
        creatorId: 'band',
      };
      return coverageYear
        .handler(slots)
        .then(res => {
          expect(res).to.have.property('items').with.deep.members([{
            coverage: 'NY',
            year: 2017,
          }]);
        });
    });
  });
});
