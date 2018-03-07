const {expect} = require('chai');
const rewire = require('rewire');

const playlist = require('../../../state/playlist');
const query = require('../../../state/query');
const albums = rewire('../../../extensions/feeders/albums');

const mockApp = require('../../_utils/mocking/app');
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
    it('should fetch album', () => {
      return albums
        .build({app, playlist, query})
        .then(() => {
          expect(playlist.hasNextSong(app)).to.be.true;
          expect(playlist.getCurrentSong(app)).to.be.ok;
          expect(albums.isEmpty({app, query, playlist})).to.be.false;
          expect(albums.getCurrentItem({app, playlist, query})).to.be.ok;
          expect(albums.hasNext({app, query, playlist})).to.be.true;
        });
    });

    it('should move to the next song on albums.next', () => {
      return albums
        .build({app, playlist, query})
        .then(() => {
          expect(albums.getCurrentItem({app, query, playlist}))
            .to.have.property('identifier', 'song-1');
          return albums.next({app, query, playlist});
        })
        .then(() => {
          expect(albums.getCurrentItem({app, query, playlist}))
            .to.have.property('identifier', 'song-2');
        });
    });
  });
});
