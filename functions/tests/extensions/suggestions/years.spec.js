const {expect} = require('chai');
const rewire = require('rewire');

const suggestions = rewire('../../../src/extensions/suggestions/years');

const mockAlbumProvider = require('../../_utils/mocking/provider/albums');

describe('suggestions', () => {
  describe('years', () => {
    let albumProvider;

    beforeEach(() => {
      albumProvider = mockAlbumProvider({
        fetchAlbumsByQueryResolve: {
          items: [{
            year: 1970,
          }, {
            year: 1970,
          }, {
            year: 1970,
          }, {
            year: 1999,
          }, {
            year: 1999,
          }, {
            year: 1999,
          }, {
            year: 2000,
          }, {
            year: 2000,
          }, {
            year: 2000,
          }, {
            year: 2017,
          }, {
            year: 2017,
          }],
        },
      });
      suggestions.__set__('albumsProvider', albumProvider);
    });

    it('should have slots', () => {
      expect(suggestions).to.have.property('slots');
    });

    it('should have handler', () => {
      expect(suggestions).to.have.property('handle');
    });

    it('should fetch all years', () => {
      const slots = {
        creatorId: 'band',
      };
      return suggestions
        .handle(slots)
        .then(res => {
          expect(res).to.have.property('items').with.deep.members([
            1970,
            1999,
            2000,
            2017,
          ]);
        });
    });
  });
});
