const {expect} = require('chai');
const fetchMock = require('fetch-mock');
const audio = require('../../search/audio');
const gratefulAlbum = require('./fixtures/grateful-dead-1973.json');

describe('search', () => {
  describe('audio', () => {
    beforeEach(() => {
      fetchMock.config.overwriteRoutes = true;
      fetchMock.get('begin:http://web.archive.org/metadata/', gratefulAlbum);
    });

    describe('getAlbumById', () => {
      it('should return list of songs by album id', function () {
        this.timeout(4000);
        return audio.getAlbumById('gd73-06-10.sbd.hollister.174.sbeok.shnf')
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
});
