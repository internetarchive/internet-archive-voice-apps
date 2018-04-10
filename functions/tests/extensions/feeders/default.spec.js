const {expect} = require('chai');

const DefaultFeeder = require('../../../src/extensions/feeders/_default');

describe('feeders', () => {
  describe('default', () => {
    describe('processAlbumSongs', () => {
      it('should include collections except fav', () => {
        const album = {
          id: '78_the-continental-you-kiss-while-youre-dancing_larry-adler-harbach-kern_gbia0034616',
          collections: ['georgeblood', '78rpm_kusf', '78rpm', 'audio_music'],
          creator: ['Kern', 'Harbach', 'Conrad', 'Magidson', 'Larry Adler'],
          year: NaN,
          coverage: 'USA',
          title: '(When Your Heart\'s On Fire) Smoke Gets in Your Eyes; The Continental (You Kiss While You\'re Dancing)',
          songs: [{
            filename: '07 - (When Your Heart\'s On Fire) Smoke Gets in Yo - Larry Adler.mp3',
            title: '(When Your Heart\'s On Fire) Smoke Gets in Your Eyes',
          }, {
            filename: '08 - The Continental (You Kiss While You\'re Danci - Larry Adler.mp3',
            title: 'The Continental (You Kiss While You\'re Dancing)',
          }],
        };

        const feeder = new DefaultFeeder();
        const songs = feeder.processAlbumSongs(album);
        expect(songs).to.have.length(2);
        expect(songs[0]).to.have.property('collections', album.collections);
        expect(songs[1]).to.have.property('collections', album.collections);
      });
    });
  });
});
