const {expect} = require('chai');
const fetchMock = require('fetch-mock');
fetchMock.config.overwriteRoutes = true;
const rewire = require('rewire');

const creators = rewire('../../src/provider/creators');

const popularAlbums = require('./fixtures/popular-of-etree.json');

describe('providers', () => {
  describe('creators', () => {
    beforeEach(() => {
      creators.__set__(
        'fetch',
        fetchMock
          .sandbox()
          .get('begin:https://web.archive.org/advancedsearch.php', popularAlbums)
      );
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
