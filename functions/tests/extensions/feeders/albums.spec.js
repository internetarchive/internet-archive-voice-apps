const { expect } = require('chai');
const rewire = require('rewire');

const albums = rewire('../../../src/extensions/feeders/albums');
const playlist = require('../../../src/state/playlist');
const query = require('../../../src/state/query');

const mockApp = require('../../_utils/mocking/platforms/app');
const mockAlbumsProvider = require('../../_utils/mocking/provider/albums');

describe('feeders', () => {
  let app;
  beforeEach(() => {
    app = mockApp();
    albums.__set__('albumsProvider', mockAlbumsProvider({
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
      },
      fetchAlbumsByQueryResolve: {
        items: [{
          identifier: 'album-1',
        }],
      },
    }));
    query.setSlot(app, 'collection', 'live');
    query.setSlot(app, 'creator', 'gratefuldead');
    query.setSlot(app, 'album', 'the-best');
  });

  describe('albums', () => {
    // TODO: test empty response
    describe('none', () => {
      let originalAlbumsProvider;

      beforeEach(() => {
        originalAlbumsProvider = albums.__get__('albumsProvider');
        albums.__set__('albumsProvider', mockAlbumsProvider({
          fetchAlbumDetailsResolve: null,
          fetchAlbumsByQueryResolve: {
            items: [],
          },
        }));
      });

      afterEach(() => {
        albums.__set__('albumsProvider', originalAlbumsProvider);
      });

      it('should return empty list of songs, when there is no songs', () => {
        return albums
          .build({ app, playlist, query })
          .then(() => {
            expect(playlist.hasNextSong(app)).to.be.false;
            expect(playlist.getCurrentSong(app)).to.be.null;
            expect(albums.isEmpty({ app, query, playlist })).to.be.true;
            expect(albums.getCurrentItem({ app, playlist, query })).to.be.null;
            expect(albums.hasNext({ app, query, playlist })).to.be.false;
          });
      });
    });

    it('should fetch album', () => {
      return albums
        .build({ app, playlist, query })
        .then(() => {
          expect(playlist.hasNextSong(app)).to.be.true;
          expect(playlist.getCurrentSong(app)).to.be.ok;
          expect(albums.isEmpty({ app, query, playlist })).to.be.false;
          expect(albums.getCurrentItem({ app, playlist, query })).to.be.ok;
          expect(albums.hasNext({ app, query, playlist })).to.be.true;
        });
    });

    it('should move to the next song on albums.next', () => {
      return albums
        .build({ app, playlist, query })
        .then(() => {
          expect(albums.getCurrentItem({ app, query, playlist }))
            .to.have.property('identifier', 'song-1');
          return albums.next({ app, query, playlist });
        })
        .then(() => {
          expect(albums.getCurrentItem({ app, query, playlist }))
            .to.have.property('identifier', 'song-2');
        });
    });
  });
});
