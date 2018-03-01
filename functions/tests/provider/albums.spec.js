const {expect} = require('chai');
const fetchMock = require('fetch-mock');
fetchMock.config.overwriteRoutes = true;
const rewire = require('rewire');

const albumsProvider = rewire('../../provider/albums');

const gratefulAlbum = require('./fixtures/grateful-dead-1973.json');
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

  describe('fetchAlbumDetails', () => {
    beforeEach(() => {
      albumsProvider.__set__(
        'fetch',
        fetchMock
          .sandbox()
          .get('begin:https://web.archive.org/metadata/', gratefulAlbum)
      );
    });

    it('should return list of songs by album id', function () {
      this.timeout(10000);
      return albumsProvider.fetchAlbumDetails('gd73-06-10.sbd.hollister.174.sbeok.shnf')
        .then(album => {
          expect(album).to.have.property('creator', 'Grateful Dead');
          expect(album).to.have.property('year', 1973);
          expect(album).to.have.property('coverage', 'Washington, DC');
          expect(album).to.have.property('title',
            'Grateful Dead Live at Robert F. Kennedy Stadium on 1973-06-10'
          );
          expect(album).to.have.property('songs');
          const songs = album.songs;
          expect(songs[0]).to.have.property('filename', 'gd73-06-10d1t01.mp3');
          expect(songs[0]).to.have.property('title', 'Morning Dew');
          expect(songs[30]).to.have.property('filename', 'gd73-06-10d4t09.mp3');
          expect(songs[30]).to.have.property('title', 'Johnny B. Goode');
        });
    });
  });
});
