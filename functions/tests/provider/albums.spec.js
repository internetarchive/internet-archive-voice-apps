const {expect} = require('chai');
const fetchMock = require('fetch-mock');
fetchMock.config.overwriteRoutes = true;
const rewire = require('rewire');

const albumsProvider = rewire('../../src/provider/albums');

const gratefulAlbum = require('./fixtures/grateful-dead-1973.json');
const ofARevolution = require('./fixtures/of-a-revolution-items.json');
const smokeGetsInYourEyesPlate = require('./fixtures/smoke-gets-in-your-eyes-plate.json');

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
      return albumsProvider.fetchAlbumsByCreatorId('OfARevolution', {limit: 3})
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
      albumsProvider.__set__(
        'fetch',
        fetchMock
          .sandbox()
          .get('begin:https://web.archive.org/metadata/', gratefulAlbum)
      );

      return albumsProvider.fetchAlbumDetails('gd73-06-10.sbd.hollister.174.sbeok.shnf')
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
      albumsProvider.__set__(
        'fetch',
        fetchMock
          .sandbox()
          .get('begin:https://web.archive.org/metadata/', smokeGetsInYourEyesPlate)
      );

      // plates have many of songs duplications
      // but luckly they don't have title field, we will use it
      return albumsProvider.fetchAlbumDetails('78_the-continental-you-kiss-while-youre-dancing_larry-adler-harbach-kern_gbia0034616')
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
    let f;
    beforeEach(() => {
      f = fetchMock
        .sandbox()
        .get('begin:https://web.archive.org/advancedsearch.php?q=', ofARevolution);
      albumsProvider.__set__('fetch', f);
    });

    it('should fetch single collection', () => {
      return albumsProvider
        .fetchAlbumsByQuery({
          collectionId: 'collection-1',
        })
        .then((res) => {
          expect(res).to.be.ok;
          expect(f.lastUrl(
            'begin:https://web.archive.org/advancedsearch.php?q=',
            'GET'
          )).to.be.equal(
            'https://web.archive.org/advancedsearch.php?q=' +
            'coverage:(*) AND collection:(collection-1)' +
            '&fl[]=identifier,coverage,title,year' +
            '&sort[]=downloads+desc' +
            '&rows=3' +
            '&page=0' +
            '&output=json'
          );
        });
    });

    it('should fetch group of collections', () => {
      return albumsProvider
        .fetchAlbumsByQuery({
          collectionId: ['collection-1', 'collection-2'],
        })
        .then((res) => {
          expect(f.lastUrl(
            'begin:https://web.archive.org/advancedsearch.php?q=',
            'GET'
          )).to.be.equal(
            'https://web.archive.org/advancedsearch.php?q=' +
            'coverage:(*) AND (collection:(collection-1) OR collection:(collection-2))' +
            '&fl[]=identifier,coverage,title,year' +
            '&sort[]=downloads+desc' +
            '&rows=3' +
            '&page=0' +
            '&output=json'
          );
        });
    });
  });
});
