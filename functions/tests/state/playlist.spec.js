const {expect} = require('chai');

const playlist = require('../../state/playlist');

const mockApp = require('../_utils/mocking/app');

describe('playlist', () => {
  let app;

  beforeEach(() => {
    app = mockApp();
    app.data.playlist = {
      current: 1,
      items: [
          {track: 1, title: 'song 1'},
          {track: 2, title: 'song 2'},
          {track: 3, title: 'song 3'},
      ],
    };
  });

  describe('reducers', () => {
    describe('create', () => {
      it('should populate list of items and reset current song', () => {
        playlist.create(app, [
          {track: 3, title: 'song 3'},
          {track: 4, title: 'song 4'},
        ]);

        expect(playlist.getCurrentSong(app)).to.have.property('title', 'song 3');
      });
    });

    describe('next', () => {
      it('should move pointer to the next song', () => {
        playlist.next(app);
        expect(app.data.playlist).to.have.property('current', 2);
      });
    });
  });

  describe('selectors', () => {
    describe('getCurrentSong', () => {
      it('should return current song', () => {
        const song = playlist.getCurrentSong(app);
        expect(song).to.have.property('track', 2);
        expect(song).to.have.property('title', 'song 2');
      });
    });

    describe('hasNextSong', () => {
      it('should return true if we have next song', () => {
        expect(playlist.hasNextSong(app)).to.be.true;
      });

      it('should return false if we do not have next song', () => {
        app.data.playlist.current = 2;
        expect(playlist.hasNextSong(app)).to.be.false;
      });
    });
  });
});
