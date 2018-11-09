const { expect } = require('chai');
const sinon = require('sinon');

const natural = require('../../../src/extensions/orders/natural');

describe('extensions', () => {
  describe('orders', () => {
    describe('natural', () => {
      let app;
      let cursor;
      let playlist;

      beforeEach(() => {
        app = {};
        cursor = {
          current: {
            album: 0,
            song: 0,
          },
          total: {
            albums: 1,
            songs: 1,
          },
        };
        playlist = {
          getExtra: sinon.stub().returns({ cursor }),
        };
      });

      describe('#hasNext', () => {
        it('should have next song when it is not the last album', () => {
          cursor.current.album = 4;
          cursor.total.albums = 10;
          cursor.current.song = 0;
          cursor.total.songs = 10;
          expect(natural.hasNext({ app, playlist })).to.be.true;
        });

        it('should have next song when it is not the last song of the last album', () => {
          cursor.current.album = 3;
          cursor.total.albums = 4;
          cursor.current.song = 5;
          cursor.total.songs = 10;
          expect(natural.hasNext({ app, playlist })).to.be.true;
        });

        it('should have next song when it is the last song of the last album', () => {
          cursor.current.album = 3;
          cursor.total.albums = 4;
          cursor.current.song = 9;
          cursor.total.songs = 10;
          expect(natural.hasNext({ app, playlist })).to.be.false;
        });
      });

      describe('#hasPrevious', () => {
        it('should have previous song when it is not the first album', () => {
          cursor.current.album = 4;
          cursor.total.albums = 10;
          cursor.current.song = 0;
          cursor.total.songs = 1;
          expect(natural.hasPrevious({ app, playlist })).to.be.true;
        });

        it('should have previous song when it is not the first song in the 1st album', () => {
          cursor.current.album = 0;
          cursor.total.albums = 10;
          cursor.current.song = 1;
          cursor.total.songs = 1;
          expect(natural.hasPrevious({ app, playlist })).to.be.true;
        });

        it('should not have previous song when it is the first song in the 1st album', () => {
          cursor.current.album = 0;
          cursor.total.albums = 10;
          cursor.current.song = 0;
          cursor.total.songs = 1;
          expect(natural.hasPrevious({ app, playlist })).to.be.false;
        });
      });
    });
  });
});
