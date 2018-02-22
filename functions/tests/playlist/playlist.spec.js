const {expect} = require('chai');

const playlist = require('../../playlist');

const mockApp = require('../_utils/mocking/app');

describe('playlist', () => {
  let app;

  beforeEach(() => {
    app = mockApp();
  });

  describe('getCurrentSong', () => {
    it('should return current song', () => {
      app.data.playlist = {
        current: 1,
        list: [{
          id: '1',
          title: 'song 1',
        }, {
          id: '2',
          title: 'song 2',
        }, {
          id: '3',
          title: 'song 3',
        }, ],
      };
      const song = playlist.getCurrentSong(app);
      expect(song).to.have.property('id', '2');
      expect(song).to.have.property('title', 'song 2');
    });
  });
});
