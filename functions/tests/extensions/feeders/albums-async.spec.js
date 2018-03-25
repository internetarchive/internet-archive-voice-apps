const {expect} = require('chai');
const rewire = require('rewire');
const sinon = require('sinon');

const feeder = rewire('../../../src/extensions/feeders/albums-async');
const playlist = require('../../../src/state/playlist');
const query = require('../../../src/state/query');

const mockApp = require('../../_utils/mocking/app');
const mockAlbumsProvider = require('../../_utils/mocking/provider/albums');
const mockOrderStrategy = require('../../_utils/mocking/orders/orderStategy');

describe('feeders', () => {
  describe('albums async', () => {
    let albumsProvider;
    let app;

    function mockNewAlbum (album) {
      albumsProvider = Object.assign({}, albumsProvider, mockAlbumsProvider({
        fetchAlbumsByQueryResolve: {
          items: album ? [{
            identifier: album,
          }] : [],
          total: album ? 3 : 0,
        },

        fetchAlbumDetailsResolve: album,
      }));
      feeder.__set__('albumsProvider', albumsProvider);
    }

    function testNextSong ({album, app, feeder, filename, playlist, query, hasNext = true, moveToNext = true}) {
      let resolve;
      if (moveToNext) {
        resolve = feeder.next({app, query, playlist});
      } else {
        resolve = Promise.resolve();
      }

      return resolve
        .then(() => {
          expect(feeder.isEmpty({app, query, playlist})).to.be.false;
          expect(feeder.getCurrentItem({app, query, playlist}))
            .to.have.property('filename', filename);
          expect(feeder.getCurrentItem({app, query, playlist}))
            .to.have.property('album')
            .to.have.property('title', album);
          expect(feeder.hasNext({app, query, playlist})).to.be.equal(hasNext);
        });
    }

    it('should fetch next ordered song', () => {
      app = mockApp();
      // TODO: should try with undefined order
      query.setSlot(app, 'order', 'natural');
      mockNewAlbum({
        title: 'album-1',
        songs: [{
          filename: 'filename-1',
        }, {
          filename: 'filename-2',
        }, {
          filename: 'filename-3',
        }]
      });

      return feeder
        .build({app, query, playlist})
        .then(() => testNextSong({
          album: 'album-1',
          app,
          feeder,
          filename: 'filename-1',
          playlist,
          query,
          moveToNext: false,
        }))
        .then(() => testNextSong({
          album: 'album-1',
          app,
          feeder,
          filename: 'filename-2',
          playlist,
          query
        }))
        .then(() => {
          // we will request next chunk of songs
          mockNewAlbum({
            title: 'album-1',
            songs: [{
              filename: 'filename-1',
            }, {
              filename: 'filename-2',
            }, {
              filename: 'filename-3',
            }]
          });
        })
        .then(() => testNextSong({
          album: 'album-1',
          app,
          feeder,
          filename: 'filename-3',
          playlist,
          query
        }))
        .then(() => {
          // we will request next chunk of songs
          mockNewAlbum({
            title: 'album-2',
            songs: [{
              filename: 'filename-1',
            }, {
              filename: 'filename-2',
            }, {
              filename: 'filename-3',
            }]
          });
        })
        .then(() => testNextSong({
          album: 'album-2',
          app,
          feeder,
          filename: 'filename-1',
          playlist,
          query,
        }))
        .then(() => testNextSong({
          album: 'album-2',
          app,
          feeder,
          filename: 'filename-2',
          playlist,
          query
        }))
        .then(() => {
          // we will request next chunk of songs
          mockNewAlbum({
            title: 'album-2',
            songs: [{
              filename: 'filename-1',
            }, {
              filename: 'filename-2',
            }, {
              filename: 'filename-3',
            }]
          });
        })
        .then(() => testNextSong({
          album: 'album-2',
          app,
          feeder,
          filename: 'filename-3',
          playlist,
          query
        }))
        .then(() => {
          // we will request next chunk of songs
          mockNewAlbum({
            title: 'album-3',
            songs: [{
              filename: 'filename-1',
            }, {
              filename: 'filename-2',
            }, {
              filename: 'filename-3',
            }]
          });
        })
        .then(() => testNextSong({
          album: 'album-3',
          app,
          feeder,
          filename: 'filename-1',
          playlist,
          query
        }))
        .then(() => testNextSong({
          album: 'album-3',
          app,
          feeder,
          filename: 'filename-2',
          playlist,
          query
        }))
        .then(() => {
          // we will request next chunk of songs
          mockNewAlbum({
            title: 'album-3',
            songs: [{
              filename: 'filename-1',
            }, {
              filename: 'filename-2',
            }, {
              filename: 'filename-3',
            }]
          });
        })
        .then(() => testNextSong({
          album: 'album-3',
          app,
          feeder,
          filename: 'filename-3',
          playlist,
          query,
          hasNext: false,
        }));
    });

    it('should fetch next random song', () => {
      const orderStrategy = mockOrderStrategy();
      const orderStrategies = {
        getByName: sinon.stub().returns(orderStrategy),
      };
      feeder.__set__('orderStrategies', orderStrategies);

      app = mockApp();
      query.setSlot(app, 'order', 'random');

      mockNewAlbum({
        title: 'album-1',
        songs: [{
          filename: 'filename-1',
        }, {
          filename: 'filename-2',
        }, {
          filename: 'filename-3',
        }]
      });

      return feeder
        .build({app, query, playlist})
        .then(() => testNextSong({
          album: 'album-1',
          app,
          feeder,
          filename: 'filename-1',
          playlist,
          query,
          moveToNext: false,
        }))
        .then(() => testNextSong({
          album: 'album-1',
          app,
          feeder,
          filename: 'filename-2',
          playlist,
          query
        }))
        .then(() => {
          // we will request next chunk of songs
          mockNewAlbum({
            title: 'album-2',
            songs: [{
              filename: 'filename-1',
            }, {
              filename: 'filename-2',
            }, {
              filename: 'filename-3',
            }]
          });
        })
        .then(() => testNextSong({
          album: 'album-2',
          app,
          feeder,
          filename: 'filename-1',
          playlist,
          query,
        }))
        .then(() => testNextSong({
          album: 'album-2',
          app,
          feeder,
          filename: 'filename-2',
          playlist,
          query
        }));
    });

    it('should build feeder with 0 songs for empty response', () => {
      app = mockApp();
      query.setSlot(app, 'order', 'natural');
      mockNewAlbum(null);

      return feeder
        .build({app, query, playlist})
        .then(res => {
          expect(res).to.have.property('total', 0);
          expect(playlist.isEmpty(app)).to.be.true;
        });
    });
  });
});
