const {expect} = require('chai');
const fetchMock = require('fetch-mock');
fetchMock.config.overwriteRoutes = true;
const rewire = require('rewire');

const audio = rewire('../../provider/audio');

const gratefulAlbum = require('./fixtures/grateful-dead-1973.json');
const gratefulAlbums = require('./fixtures/grateful-dead-5-albums.json');
const hippopotamus = require('./fixtures/i-want-a-hippopotamus-for-christmas.json');

describe('search', () => {
  describe('audio', () => {
    beforeEach(() => {
      audio.__set__(
        'fetch',
        fetchMock
          .sandbox()
          .get('begin:https://web.archive.org/metadata/', gratefulAlbum)
      );
    });

    describe('fetchAlbumDetails', () => {
      it('should return list of songs by album id', function () {
        this.timeout(10000);
        return audio.fetchAlbumDetails('gd73-06-10.sbd.hollister.174.sbeok.shnf')
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

    describe('getSongUrlByAlbumFileName', () => {
      it('should return url of song', () => {
        expect(audio.getSongUrlByAlbumIdAndFileName(
          'gd73-06-10.sbd.hollister.174.sbeok.shnf',
          'gd73-06-10d1t01.mp3'
        )).to.be.equal(
          'https://archive.org/download/' +
          'gd73-06-10.sbd.hollister.174.sbeok.shnf/' +
          'gd73-06-10d1t01.mp3'
        );
      });
    });

    describe('fetchAlbumsByCreatorId', () => {
      beforeEach(() => {
        audio.__set__(
          'fetch',
          fetchMock
            .sandbox()
            .get('begin:https://web.archive.org/advancedsearch.php', gratefulAlbums)
        );
      });

      it('should return list of albums', () => {
        return audio.fetchAlbumsByCreatorId('GratefulDead', {limit: 5})
          .then(albums => {
            expect(albums).to.have.length(5);
            expect(albums[0]).to.have.property(
              'id',
              'gd73-06-10.sbd.hollister.174.sbeok.shnf'
            );
            expect(albums[0]).to.have.property(
              'name',
              'Washington, DC'
            );
            expect(albums[0]).to.have.property(
              'subject',
              'Soundboard'
            );
            expect(albums[0]).to.have.property(
              'title',
              'Grateful Dead Live at Robert F. Kennedy Stadium on 1973-06-10'
            );
            expect(albums[0]).to.have.property(
              'year', 1973
            );
            expect(albums[4]).to.have.property(
              'id',
              'gd77-05-07.sbd.eaton.wizard.26085.sbeok.shnf'
            );
            expect(albums[4]).to.have.property(
              'name',
              'Boston, MA'
            );
            expect(albums[4]).to.have.property(
              'subject',
              'Live concert'
            );
            expect(albums[4]).to.have.property(
              'title',
              'Grateful Dead Live at Boston Garden on 1977-05-07'
            );
            expect(albums[4]).to.have.property(
              'year', 1977
            );
          });
      });
    });

    describe('fetchNewMusic', () => {
      beforeEach(() => {
        audio.__set__(
          'fetch',
          fetchMock
            .sandbox()
            .get('begin:https://web.archive.org/metadata/', hippopotamus)
        );
      });

      it('should fetch album, when we have its id', function () {
        this.timeout(5000);

        const search = {
          albumId: 'qwerty',
        };

        return audio.fetchNewMusic(search)
          .then(songs => {
            expect(songs).to.have.property('items').to.have.length(5);
            expect(songs).to.have.property('total', 5);
            expect(songs.items[0]).to.have.property('audioURL');
            expect(songs.items[0]).to.have.property('coverage');
            expect(songs.items[0]).to.have.property('imageURL');
            expect(songs.items[0]).to.have.property('track');
            expect(songs.items[0]).to.have.property('year');
          });
      });
    });
  });
});
