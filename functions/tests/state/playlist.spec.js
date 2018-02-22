const {expect} = require('chai');

const playlist = require('../../state/playlist');

const mockApp = require('../_utils/mocking/app');

describe('playlist', () => {
  let app;

  beforeEach(() => {
    app = mockApp();
    app.data.playlist = {
      current: 1,
      items: [{
        id: '1',
        title: 'song 1',
      }, {
        id: '2',
        title: 'song 2',
      }, {
        id: '3',
        title: 'song 3',
      }],
    };
  });

  describe('getCurrentSong', () => {
    it('should return current song', () => {
      const song = playlist.getCurrentSong(app);
      expect(song).to.have.property('id', '2');
      expect(song).to.have.property('title', 'song 2');
    });
  });

  describe('hasNextSong', () => {
    it('should return true if we have next song', () => {
      expect(playlist.hasNextSong(app)).to.be.true;
    });
  });

  describe('next', () => {
    it('should move pointer to the next song', () => {
      playlist.next(app);
      expect(app.data.playlist).to.have.property('current', 2);
    });
  });
});
