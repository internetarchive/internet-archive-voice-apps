const MockAdapter = require('axios-mock-adapter');
const { expect } = require('chai');
const rewire = require('rewire');

const albumsProvider = rewire('../../src/provider/albums');

const mockApp = require('../_utils/mocking/platforms/app');

const gratefulAlbum = require('./fixtures/grateful-dead-1973.json');
const ofARevolution = require('./fixtures/of-a-revolution-items.json');
const smokeGetsInYourEyesPlate = require('./fixtures/smoke-gets-in-your-eyes-plate.json');

describe('albums', () => {
  let app;

  beforeEach(() => {
    app = mockApp();
  });

  describe('extractYear', () => {
    it('should it extract year and conver it to year number', () => {
      expect(albumsProvider.extractYear({
        year: '1999',
      })).to.be.equal(1999);
    });

    it('should it extract date and conver it to year number', () => {
      expect(albumsProvider.extractYear({
        date: '1999/1/2',
      })).to.be.equal(1999);
    });

    it('should return undefined, when we do not have year or date', () => {
      expect(albumsProvider.extractYear({
      })).to.be.undefined;
    });
  });

  describe('fetchAlbums', () => {
    beforeEach(() => {
      const mock = new MockAdapter(albumsProvider.__get__('axios'));
      mock.onGet().reply(200, ofARevolution);
    });

    it('should fetch items of collection', () => {
      return albumsProvider.fetchAlbumsByCreatorId('OfARevolution', { limit: 3 })
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
    it('should return list of songs by album id', () => {
      const mock = new MockAdapter(albumsProvider.__get__('axios'));
      mock.onGet().reply(200, gratefulAlbum);

      return albumsProvider.fetchAlbumDetails(app, 'gd73-06-10.sbd.hollister.174.sbeok.shnf')
        .then(album => {
          expect(album).to.have.property('collections').to.have.members([
            'GratefulDead',
            'etree',
            'stream_only',
          ]);
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

    it('should return list of songs for plate', () => {
      const mock = new MockAdapter(albumsProvider.__get__('axios'));
      mock.onGet().reply(200, smokeGetsInYourEyesPlate);

      // plates have many of songs duplications
      // but luckly they don't have title field, we will use it
      return albumsProvider.fetchAlbumDetails(app, '78_the-continental-you-kiss-while-youre-dancing_larry-adler-harbach-kern_gbia0034616')
        .then(album => {
          expect(album)
            .to.have.property('songs')
            .to.have.length(2);

          expect(album).to.have.property('collections').to.have.members([
            'georgeblood',
            '78rpm_kusf',
            '78rpm',
            'audio_music',
          ]);
          expect(album.songs[0]).to.have.property('title', `(When Your Heart's On Fire) Smoke Gets in Your Eyes`);
          expect(album.songs[1]).to.have.property('title', `The Continental (You Kiss While You're Dancing)`);
        });
    });
  });

  describe('fetchAlbumsByQuery', () => {
    let urls;

    beforeEach(() => {
      urls = [];

      const mock = new MockAdapter(albumsProvider.__get__('axios'));
      mock.onGet().reply((config) => {
        urls.push(config.url);
        return [200, ofARevolution];
      });
    });

    it('should fetch single collection', () => {
      return albumsProvider
        .fetchAlbumsByQuery(app, {
          collectionId: 'collection-1',
          order: 'downloads+desc',
        })
        .then((res) => {
          expect(res).to.be.ok;
          expect(urls[0]).to.be.equal(
            'https://gactions-api.archive.org/advancedsearch.php?q=' +
            '_exists_:coverage%20AND%20collection:collection-1' +
            '&fl%5B%5D=identifier,coverage,title,year' +
            '&sort%5B%5D=downloads+desc' +
            '&rows=3' +
            '&output=json'
          );
        });
    });

    it('should page when we pass it as parameter', () => {
      return albumsProvider
        .fetchAlbumsByQuery(app, {
          collectionId: 'collection-1',
          page: 1,
          order: 'downloads+desc',
        })
        .then((res) => {
          expect(res).to.be.ok;
          expect(urls[0]).to.be.equal(
            'https://gactions-api.archive.org/advancedsearch.php?q=' +
            '_exists_:coverage%20AND%20collection:collection-1' +
            '&fl%5B%5D=identifier,coverage,title,year' +
            '&sort%5B%5D=downloads+desc' +
            '&rows=3' +
            '&page=1' +
            '&output=json'
          );
        });
    });

    it('should fetch group of collections', () => {
      return albumsProvider
        .fetchAlbumsByQuery(app, {
          collectionId: ['collection-1', 'collection-2'],
          order: 'downloads+desc',
        })
        .then((res) => {
          expect(urls[0]).to.be.equal(
            'https://gactions-api.archive.org/advancedsearch.php?q=' +
            '_exists_:coverage%20AND%20(collection:collection-1%20OR%20collection:collection-2)' +
            '&fl%5B%5D=identifier,coverage,title,year' +
            '&sort%5B%5D=downloads+desc' +
            '&rows=3' +
            '&output=json'
          );
        });
    });

    it(`should skip order when we haven't explicitly specified it`, () => {
      return albumsProvider
        .fetchAlbumsByQuery(app, {
          collectionId: 'collection-1',
        })
        .then((res) => {
          expect(urls[0]).to.be.equal(
            'https://gactions-api.archive.org/advancedsearch.php?q=' +
            '_exists_:coverage%20AND%20collection:collection-1' +
            '&fl%5B%5D=identifier,coverage,title,year' +
            '&rows=3' +
            '&output=json'
          );
        });
    });
  });
});
