const {expect} = require('chai');
const fetchMock = require('fetch-mock');
fetchMock.config.overwriteRoutes = true;
const rewire = require('rewire');

const albumsProvider = rewire('../../provider/albums');

const ofARevolution = require('./fixtures/of-a-revolution-items.json');

describe('collection', () => {
  describe('fetchAlbums', () => {
    beforeEach(() => {
      albumsProvider.__set__(
        'fetch',
        fetchMock
          .sandbox()
          .get('begin:https://web.archive.org/advancedsearch.php?q=', ofARevolution)
      );
    });

    it('should fetch items of collection', () => {
      return albumsProvider.fetchAlbums('OfARevolution', {limit: 3})
        .then(albums => {
          const items = albums.items;
          expect(items[0]).to.have.property('identifier', 'oar00-09-27');
          expect(items[0]).to.have.property('coverage', 'Columbus, OH');
          expect(items[0]).to.have.property('subject', 'Live concert');
          expect(items[0]).to.have.property('title', 'Of A Revolution Live at South Oval - Ohio State University on 2000-09-27');
          expect(items[0]).to.have.property('year', 2000);
        });
    });
  });
});
