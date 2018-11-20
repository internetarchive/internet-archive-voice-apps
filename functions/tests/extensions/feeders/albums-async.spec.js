const { expect } = require('chai');
const _ = require('lodash');
const rewire = require('rewire');
const sinon = require('sinon');

const feeder = rewire('../../../src/extensions/feeders/albums-async');
const playlist = require('../../../src/state/playlist');
const query = require('../../../src/state/query');

const mockApp = require('../../_utils/mocking/platforms/app');
const mockAlbumsProvider = require('../../_utils/mocking/provider/albums');
const mockOrderStrategy = require('../../_utils/mocking/orders/orderStategy');

describe('feeders', () => {
  describe('albums async', () => {
    let albumsProvider;
    let app;

    function mockNewAlbum (album, numOfAlbums = 3) {
      albumsProvider = Object.assign({}, albumsProvider, mockAlbumsProvider({
        fetchAlbumsByQueryResolve: {
          items: album ? [{
            identifier: album,
          }] : [],
          total: numOfAlbums,
        },

        fetchAlbumDetailsResolve: album,
      }));
      feeder.__set__('albumsProvider', albumsProvider);
    }

    function testNextSong ({ album, app, feeder, filename, playlist, query, hasNext = true, moveToNext = true, fetchOnly = false }) {
      let resolve;
      if (moveToNext || fetchOnly) {
        resolve = feeder.next({ app, query, playlist }, !fetchOnly);
      } else {
        resolve = Promise.resolve();
      }

      return resolve
        .then(() => {
          expect(feeder.isEmpty({ app, query, playlist }))
            .to.be.false;

          if (filename) {
            expect(feeder.getCurrentItem({ app, query, playlist }))
              .to.have.property('filename', filename);
          }

          if (album) {
            expect(feeder.getCurrentItem({ app, query, playlist }))
              .to.have.property('album')
              .to.have.property('title', album);
          }

          expect(feeder.hasNext({ app, query, playlist }))
            .to.be.equal(hasNext);
        });
    }

    function testPreviousSong ({ album, app, feeder, filename, playlist, query, hasPrevious = true, moveToPrevious = true }) {
      let resolve;
      if (moveToPrevious) {
        resolve = feeder.previous({ app, query, playlist });
      } else {
        resolve = Promise.resolve();
      }

      return resolve
        .then(() => {
          expect(feeder.isEmpty({ app, query, playlist })).to.be.false;
          expect(feeder.getCurrentItem({ app, query, playlist })).to.be.ok;
          expect(feeder.getCurrentItem({ app, query, playlist }))
            .to.have.property('filename', filename);
          expect(feeder.getCurrentItem({ app, query, playlist }))
            .to.have.property('album')
            .to.have.property('title', album);
          expect(feeder.hasPrevious({ app, query, playlist })).to.be.equal(hasPrevious);
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

      const ctx = {
        app,
        feeder,
        playlist,
        query,
      };

      return feeder
        .build({ app, query, playlist })
        .then(() => testNextSong({
          ...ctx,
          album: 'album-1',
          filename: 'filename-1',
          moveToNext: false,
        }))
        .then(() => testNextSong({
          ...ctx,
          album: 'album-1',
          filename: 'filename-2',
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
          ...ctx,
          album: 'album-1',
          filename: 'filename-3',
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
            }, {
              filename: 'filename-4',
            }, {
              filename: 'filename-5',
            }]
          });
        })
        .then(() => testNextSong({
          ...ctx,
          album: 'album-2',
          filename: 'filename-1',
        }))
        .then(() => testNextSong({
          ...ctx,
          album: 'album-2',
          filename: 'filename-2',
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
            }, {
              filename: 'filename-4',
            }, {
              filename: 'filename-5',
            }]
          });
        })
        .then(() => testNextSong({
          ...ctx,
          album: 'album-2',
          filename: 'filename-3',
        }))
        .then(() => testNextSong({
          ...ctx,
          album: 'album-2',
          filename: 'filename-4',
        }))
        .then(() => testNextSong({
          ...ctx,
          album: 'album-2',
          filename: 'filename-5',
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
          ...ctx,
          album: 'album-3',
          filename: 'filename-1',
        }))
        .then(() => testNextSong({
          ...ctx,
          album: 'album-3',
          filename: 'filename-2',
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
          ...ctx,
          album: 'album-3',
          filename: 'filename-3',
          hasNext: false,
        }));
    });

    it('should fetch previous ordered song', () => {
      app = mockApp();
      query.setSlot(app, 'order', 'natural');
      mockNewAlbum({
        title: 'album-4',
        songs: [{
          filename: 'filename-1',
        }, {
          filename: 'filename-2',
        }, {
          filename: 'filename-3',
        }]
      });

      return feeder
        .build({ app, query, playlist })
        .then(() => {
          // move to the 1st song of 4th album
          let extra = playlist.getExtra(app);
          extra = _.set(extra, 'cursor.current', { album: 3, song: 0 });
          playlist.setExtra(app, extra);
        })
        .then(() => testPreviousSong({
          album: 'album-4',
          app,
          feeder,
          filename: 'filename-1',
          playlist,
          query,
          moveToPrevious: false,
          hasPrevious: true,
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
        .then(() => testPreviousSong({
          album: 'album-3',
          app,
          feeder,
          filename: 'filename-3',
          playlist,
          query,
          hasPrevious: true,
        }))
        .then(() => testPreviousSong({
          album: 'album-3',
          app,
          feeder,
          filename: 'filename-2',
          playlist,
          query,
          hasPrevious: true,
        }))
        .then(() => testPreviousSong({
          album: 'album-3',
          app,
          feeder,
          filename: 'filename-1',
          playlist,
          query,
          hasPrevious: true,
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
        .then(() => testPreviousSong({
          album: 'album-2',
          app,
          feeder,
          filename: 'filename-3',
          playlist,
          query,
          hasPrevious: true,
        }))
        .then(() => testPreviousSong({
          album: 'album-2',
          app,
          feeder,
          filename: 'filename-2',
          playlist,
          query
        }))
        .then(() => testPreviousSong({
          album: 'album-2',
          app,
          feeder,
          filename: 'filename-1',
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
        .then(() => testPreviousSong({
          album: 'album-1',
          app,
          feeder,
          filename: 'filename-3',
          playlist,
          query
        }))
        .then(() => testPreviousSong({
          album: 'album-1',
          app,
          feeder,
          filename: 'filename-2',
          playlist,
          query
        }))
        .then(() => testPreviousSong({
          album: 'album-1',
          app,
          feeder,
          filename: 'filename-1',
          playlist,
          query,
          hasPrevious: false,
        }));
    });

    describe('random order', () => {
      let originalOrders;

      beforeEach(() => {
        const orderStrategy = mockOrderStrategy();
        const orders = {
          getByName: sinon.stub().returns(orderStrategy),
        };
        originalOrders = feeder.__get__('orders');
        feeder.__set__('orders', orders);
      });

      afterEach(() => {
        feeder.__set__('orders', originalOrders);
      });

      it('should fetch next', () => {
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
          .build({ app, query, playlist })
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
                filename: 'album-2/filename-1',
              }, {
                filename: 'album-2/filename-2',
              }, {
                filename: 'album-2/filename-3',
              }]
            });
          })
          .then(() => testNextSong({
            album: 'album-2',
            app,
            feeder,
            filename: 'album-2/filename-1',
            playlist,
            query,
          }))
          .then(() => testNextSong({
            album: 'album-2',
            app,
            feeder,
            filename: 'album-2/filename-2',
            playlist,
            query
          }));
      });
    });

    it('should loop to the 1st record when loop is on', () => {
      app = mockApp();
      query.setSlot(app, 'order', 'natural');
      playlist.setLoop(app, true);
      mockNewAlbum({
        title: 'album-1',
        songs: [{
          filename: 'filename-1',
        }, {
          filename: 'filename-2',
        }],
      }, 1);

      return feeder
        .build({ app, query, playlist })
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
        // loop to the 1st record
        .then(() => testNextSong({
          album: 'album-1',
          app,
          feeder,
          filename: 'filename-1',
          playlist,
          query,
        }));
    });

    it('should not loop when loop is off', () => {
      app = mockApp();
      query.setSlot(app, 'order', 'natural');
      playlist.setLoop(app, false);
      mockNewAlbum({
        title: 'album-1',
        songs: [{
          filename: 'filename-1',
        }, {
          filename: 'filename-2',
        }],
      }, 1);

      return feeder
        .build({ app, query, playlist })
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
          query,
          hasNext: false,
        }));
    });

    it('should fetch but do not move to the next song', () => {
      app = mockApp();
      query.setSlot(app, 'order', 'natural');
      playlist.setLoop(app, false);
      mockNewAlbum({
        title: 'album-1',
        songs: [{
          filename: 'filename-1',
        }, {
          filename: 'filename-2',
        }],
      }, 1);

      return feeder
        .build({ app, query, playlist })
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
          filename: 'filename-1',
          playlist,
          query,
          fetchOnly: true,
          hasNext: true
        }));
    });

    it('should fetch and move to the next song', () => {
      app = mockApp();
      query.setSlot(app, 'order', 'random');
      playlist.setLoop(app, false);
      mockNewAlbum({
        title: 'album-1',
        songs: [{
          filename: 'filename-1',
        }, {
          filename: 'filename-2',
        }],
      }, 2);

      const ctx = {
        app,
        feeder,
        playlist,
        query,
      };

      return feeder
        .build({ app, query, playlist })
        .then(() => testNextSong({
          ...ctx,
          moveToNext: false,
        }))
        .then(() => testNextSong({
          ...ctx,
          fetchOnly: true,
          hasNext: true
        }))
        .then(() => testNextSong({
          ...ctx,
          hasNext: true
        }))
        .then(() => testNextSong({
          ...ctx,
          fetchOnly: true,
          hasNext: true
        }));
    });

    it('should loop to the last record on previous when loop is on', () => {
      app = mockApp();
      query.setSlot(app, 'order', 'natural');
      playlist.setLoop(app, true);
      mockNewAlbum({
        title: 'album-1',
        songs: [{
          filename: 'filename-1',
        }, {
          filename: 'filename-2',
        }],
      }, 1);

      return feeder
        .build({ app, query, playlist })
        .then(() => testPreviousSong({
          album: 'album-1',
          app,
          feeder,
          filename: 'filename-1',
          playlist,
          query,
          moveToPrevious: false,
        }))
        // // loop to the last record
        .then(() => testPreviousSong({
          album: 'album-1',
          app,
          feeder,
          filename: 'filename-2',
          playlist,
          query,
        }));
    });

    it('should not loop on previous when loop is off', () => {
      app = mockApp();
      query.setSlot(app, 'order', 'natural');
      playlist.setLoop(app, false);
      mockNewAlbum({
        title: 'album-1',
        songs: [{
          filename: 'filename-1',
        }, {
          filename: 'filename-2',
        }],
      }, 1);

      return feeder
        .build({ app, query, playlist })
        .then(() => testPreviousSong({
          album: 'album-1',
          app,
          feeder,
          filename: 'filename-1',
          playlist,
          query,
          moveToPrevious: false,
          hasPrevious: false,
        }));
    });

    it('should build feeder with 0 songs for empty response', () => {
      app = mockApp();
      query.setSlot(app, 'order', 'natural');
      mockNewAlbum(null, 0);

      return feeder
        .build({ app, query, playlist })
        .then(res => {
          expect(res).to.have.property('total', 0);
          expect(playlist.isEmpty(app)).to.be.true;
        });
    });
  });
});
