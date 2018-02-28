const {expect} = require('chai');
const rewire = require('rewire');

const playlist = require('../../../state/playlist');
const query = require('../../../state/query');
const albums = rewire('../../../slots/fulfillments/albums');

const mockApp = require('../../_utils/mocking/app');
const mockAudio = require('../../_utils/mocking/provider/audio');
const mockCreator = require('../../_utils/mocking/provider/creator');

describe('slots', () => {
  let app;
  beforeEach(() => {
    app = mockApp();
    albums.__set__('creatorProvider', mockCreator({
      fetchAlbumsByQueryResolve: {
        items: [{
          identifier: 'album-1',
        }],
      }
    }));
    albums.__set__('audio', mockAudio({
      fetchAlbumDetailsResolve: {
        id: 'album-1',
        songs: [{
          identifier: 'song-1',
          filename: 'file-1',
        }, {
          identifier: 'song-2',
          filename: 'file-2',
        }],
        year: 2017,
        coverage: 'Toronto',
      }
    }));
  });

  describe('fulfillments', () => {
    beforeEach(() => {
      query.setSlot(app, 'collection', 'live');
      query.setSlot(app, 'creator', 'gratefuldead');
      query.setSlot(app, 'album', 'the-best');
    });

    describe('albums', () => {
      it('should fetch album', () => {
        return albums
          .build(app, query, playlist)
          .then(() => {
            expect(playlist.hasNextSong(app)).to.be.true;
            expect(playlist.getCurrentSong(app)).to.be.ok;
            expect(albums.isEmpty(app, query, playlist)).to.be.false;
            expect(albums.getCurrentItem(app, query, playlist)).to.be.ok;
            expect(albums.hasNext(app, query, playlist)).to.be.true;
          });
      });

      it('should move to the next song on albums.next', () => {
        return albums
          .build(app, query, playlist)
          .then(() => {
            expect(albums.getCurrentItem(app, query, playlist))
              .to.have.property('identifier', 'song-1');
            return albums.next(app, query, playlist);
          })
          .then(() => {
            expect(albums.getCurrentItem(app, query, playlist))
              .to.have.property('identifier', 'song-2');
          });
      });
    });
  });
});
