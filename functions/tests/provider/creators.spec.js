const MockAdapter = require('axios-mock-adapter');
const {expect} = require('chai');
const rewire = require('rewire');

const creators = rewire('../../src/provider/creators');

const popularAlbums = require('./fixtures/popular-of-etree.json');

describe('providers', () => {
  describe('creators', () => {
    beforeEach(() => {
      const mock = new MockAdapter(creators.__get__('axios'));
      mock.onGet().reply(200, popularAlbums);
    });

    describe('fetchCreators', () => {
      it('should fetch popular creators', () => {
        return creators
          .fetchCreatorsBy({
            coverage: 'london',
            creatorId: 'theband',
            collectionId: '80s',
            year: '2020',
          })
          .then((res) => {
            expect(res).to.have.property('items').with.deep.members([{
              creator: 'Grateful Dead',
              identifier: 'GratefulDead',
            }, {
              creator: 'Phil Lesh and Friends',
              identifier: 'PhilLeshandFriends',
            }, {
              creator: 'Disco Biscuits',
              identifier: 'DiscoBiscuits',
            }]);
          });
      });
    });
  });
});
