const {expect} = require('chai');

const songsProvider = require('../../src/provider/songs');

describe('search', () => {
  describe('audio', () => {
    describe('getSongUrlByAlbumFileName', () => {
      it('should return url of song', () => {
        expect(songsProvider.getSongUrlByAlbumIdAndFileName(
          'gd73-06-10.sbd.hollister.174.sbeok.shnf',
          'gd73-06-10d1t01.mp3'
        )).to.be.equal(
          'https://archive.org/download/' +
          'gd73-06-10.sbd.hollister.174.sbeok.shnf/' +
          'gd73-06-10d1t01.mp3'
        );
      });
    });
  });
});
