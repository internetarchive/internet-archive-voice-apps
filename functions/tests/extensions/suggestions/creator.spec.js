const { expect } = require('chai');
const rewire = require('rewire');
const sinon = require('sinon');

const creators = rewire('../../../src/extensions/suggestions/creators');

const mockAlbumsProvider = require('../../_utils/mocking/provider/albums');

describe('suggestions', () => {
  describe('creators', () => {
    const albumsProvider = mockAlbumsProvider({});

    beforeEach(() => {
      creators.__set__('albumsProvider', albumsProvider);
    });

    it('should have slots', () => {
      expect(creators).to.have.property('slots');
    });

    it('should have handler', () => {
      expect(creators).to.have.property('handle');
    });

    it('should remove duplicate creators by name', () => {
      const mockCreatorProvider = sinon.stub().returns(Promise.resolve({
        items: [
          { creator: 'The Grateful Dead', identifier: 'gd1' },
          { creator: 'The Grateful Dead', identifier: 'gd2' },
          { creator: 'The Cowboy Junkies', identifier: 'cj1' }
        ]
      }));
      creators.__set__('creator', {
        fetchCreatorsBy: mockCreatorProvider
      });

      return creators
        .handle({
          app: {},
          slots: { collectionId: 'etree' }
        })
        .then(res => {
          expect(res.items).to.have.lengthOf(2);
          expect(res.items.map(i => i.creator)).to.include.members([
            'The Grateful Dead',
            'The Cowboy Junkies'
          ]);
          // Verify "The Grateful Dead" appears only once
          const gratefulDeadCount = res.items.filter(i => i.creator === 'The Grateful Dead').length;
          expect(gratefulDeadCount).to.equal(1);
        });
    });

    xit('should fetch popular creators', () => {
      return creators
        .handle({
          collectionId: 'etree',
          creatorId: 'band'
        })
        .then(res => {
          expect(res).to.have.property('items').with.deep.members([
            'the Grateful Dead',
            'the Ditty Bops',
            'the Cowboy Junkies',
          ]);
        });
    });
  });
});
