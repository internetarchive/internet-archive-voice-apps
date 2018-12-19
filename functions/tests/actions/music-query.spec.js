const { expect } = require('chai');
const _ = require('lodash');
const rewire = require('rewire');
const sinon = require('sinon');

const action = rewire('../../src/actions/music-query');
const mathjsExtensions = require('../../src/mathjs');
const query = require('../../src/state/query');

const mockApp = require('../_utils/mocking/platforms/app');
const mockDialog = require('../_utils/mocking/dialog');
const mockAlbumsFeeder = require('../_utils/mocking/feeders/albums');
const mockMiddlewares = require('../_utils/mocking/middlewares');

const slotSchemeWithMultipleCases = require('./fixtures/slots-scheme-with-multiple-cases');
const slotSchemeWithOneCase = require('./fixtures/slots-scheme-with-one-case');

describe('actions / music query', () => {
  let app;
  let dialog;
  let getSuggestionProviderForSlots;
  let handler;
  let provider;
  let queryMiddlewares;
  let playbackMiddlewares;

  beforeEach(() => {
    app = mockApp({
      getByName: {
        collection: 'live',
        creatorId: 'the-band',
        coverage: 'ny',
      },
    });
    dialog = mockDialog();
    action.__set__('dialog', dialog);

    queryMiddlewares = mockMiddlewares([
      'acknowledge',
      'prompt',
      'suggestions',
      'fulfilResolvers',
      'renderSpeech',
      'ask',
    ]);
    action.__set__(queryMiddlewares);

    playbackMiddlewares = mockMiddlewares([
      'feederFromSlotScheme',
      'mapSongDataToSlots',
      'playlistFromFeeder',
      'playSong',
    ]);
    action.__set__(playbackMiddlewares);

    provider = sinon.stub().returns(Promise.resolve({
      items: [
        { coverage: 'barcelona' },
        { coverage: 'london' },
        { coverage: 'lviv' },
        { coverage: 'tokyo' },
      ],
    }));
    getSuggestionProviderForSlots = sinon.stub().returns(provider);
    action.__set__('getSuggestionProviderForSlots', getSuggestionProviderForSlots);
  });

  describe('pipeline', () => {
    beforeEach(() => {
      handler = action.build(slotSchemeWithOneCase).handler;
    });

    it('should call middlewares one-by-one', () => {
      app = mockApp({
        getByName: {
          // category: 'plate',
        },
      });
      return handler(app)
        .then(() => {
          _.each(queryMiddlewares, (middleware, name) => {
            expect(middleware).to.be.called;
          });
        });
    });
  });

  describe('multiple slot schemes', () => {
    beforeEach(() => {
      handler = action.build(slotSchemeWithMultipleCases).handler;
      mathjsExtensions.patch();
    });

    it('should get slot scheme without condition', () => {
      app = mockApp({
        getByName: {
          // category: 'plate',
        },
      });
      return handler(app)
        .then(() => {
          expect(queryMiddlewares.acknowledge).to.be.called;
          expect(queryMiddlewares.acknowledge.middleware.args[0][0])
            .to.have.property('slotScheme', slotSchemeWithMultipleCases[1]);
        });
    });

    it('should get 1st which matches condition', () => {
      app = mockApp({
        getByName: {
          category: 'plates',
        },
      });

      return handler(app)
        .then(() => {
          expect(queryMiddlewares.acknowledge).to.be.called;
          expect(queryMiddlewares.acknowledge.middleware.args[0][0])
            .to.have.property('slotScheme', slotSchemeWithMultipleCases[0]);
        });
    });

    it('should receive value for old slot', () => {
      app = mockApp({
        getByName: {
          category: 'plates',
          album: 'album1'
        },
      });
      return handler(app)
        .then(() => {
          expect(query.getSlot(app, 'album')).to.be.equal('album1');
        });
    });

    it('should receive value for new slot', () => {
      app = mockApp({
        getByName: {
          category: 'plates',
          plate: 'plate1'
        },
      });
      return handler(app)
        .then(() => {
          expect(query.getSlot(app, 'plate')).to.be.equal('plate1');
        });
    });
  });

  describe('single slot scheme', () => {
    beforeEach(() => {
      handler = action.build(slotSchemeWithOneCase).handler;
    });

    describe('defaults', () => {
      it(`should automatically populate to user state if we don't have it yet there`, () => {
        app = mockApp({
          getByName: {},
        });
        return handler(app)
          .then((ctx) => {
            // console.log('ctx', ctx);
            // console.log('query.getSlots(app)', query.getSlots(app));
            expect(query.getSlot(app, 'order')).to.be.equal('random');
          });
      });

      it(`shouldn't populate to user state if we already have this slot`, () => {
        app = mockApp({
          getByName: {
            order: 'the-best',
          },
        });
        return handler(app)
          .then(() => {
            expect(query.getSlot(app, 'order')).to.be.equal('the-best');
          });
      });
    });

    describe('fulfillment', () => {
      let albumsFeeder;
      let feeders;
      let fulfilResolvers;
      let fulfilResolversHandler;
      let revert;

      beforeEach(() => {
        app = mockApp({
          getByName: {
            collection: 'live',
            creatorId: 'the-band',
            // missed slots:
            // coverage: 'ny',
            // year: 2018,
          },
        });
        fulfilResolversHandler = sinon.stub().returns({
          app,
          slots: { creator: { title: 'Grateful Dead' } },
          slotScheme: slotSchemeWithMultipleCases[0],
          speech: 'Ok! Lets go with {{creator.title}} band!',
          suggestions: [],
        });
        fulfilResolvers = () => fulfilResolversHandler;
        revert = action.__set__('fulfilResolvers', fulfilResolvers);
        albumsFeeder = mockAlbumsFeeder();
        feeders = {
          getByName: sinon.stub().returns(albumsFeeder),
        };
        action.__set__('feeders', feeders);
      });

      afterEach(() => {
        revert();
      });

      it(`shouldn't activate when we don't have enough filled slots`, () => {
        return handler(app)
          .then(() => {
            expect(feeders.getByName).to.have.not.been.called;
          });
      });

      it(`should activate when we have enough filled slots`, () => {
        app = mockApp({
          getByName: {
            collection: 'live',
            coverage: 'ny',
            creatorId: 'the-band',
            year: 2018,
          },
        });
        return handler(app)
          .then(() => {
            expect(playbackMiddlewares.feederFromSlotScheme.middleware).to.have.been.called;
          });
      });
    });

    describe('presets', () => {
      it('should fill slots', () => {
        app = mockApp({
          getByName: {
            preset: 'your-favourite-album',
          },
        });
        return handler(app)
          .then(() => {
            expect(query.getSlot(app, 'creatorId')).to.be.equal('one-band');
            expect(query.getSlot(app, 'coverage')).to.be.equal('NY');
            expect(query.getSlot(app, 'year')).to.be.equal(1999);
          });
      });

      it('should be able to skip some slots', () => {
        app = mockApp({
          getByName: {
            preset: 'your-favourite-albums',
          },
        });
        return handler(app)
          .then(() => {
            expect(query.getSlot(app, 'creatorId')).to.be.equal('one-band');
            expect(query.getSlot(app, 'year')).to.be.equal(1999);
            expect(query.hasSlot(app, 'coverage')).to.be.true;
            expect(query.getSlots(app)).to.be.deep.equal({
              creatorId: 'one-band',
              order: 'random',
              year: 1999,
            });
          });
      });

      // TODO:
      // is not implemented yet
      // https://github.com/internetarchive/internet-archive-google-action/issues/93
      // it could be quite a complex issue
      xit('should acknowledge for chosen preset', () => {
        app = mockApp({
          getByName: {
            preset: 'your-favourite-album',
          },
        });
        return handler(app)
          .then(() => {
            expect(dialog.ask).to.have.been.calledOnce;
            expect(dialog.ask.args[0][1])
              .to.have.property('speech')
              .to.include(`Cool! You've chosen my favourite album.`);
          });
      });
    });

    describe('slot updater', () => {
      it('should fill single slot', () => {
        app = mockApp({
          getByName: {
            collection: 'live',
          },
        });
        return handler(app)
          .then(() => {
            expect(query.getSlot(app, 'collection')).to.be.equal('live');
            expect(query.getSlot(app, 'creatorId')).to.be.undefined;
            expect(query.getSlot(app, 'coverage')).to.be.undefined;
            expect(query.getSlot(app, 'year')).to.be.undefined;
          });
      });

      it('should fill multiple slots', () => {
        app = mockApp({
          getByName: {
            coverage: 'Kharkiv',
            year: 2017,
          },
        });
        return handler(app)
          .then(() => {
            expect(query.getSlot(app, 'collection')).to.be.undefined;
            expect(query.getSlot(app, 'creatorId')).to.be.undefined;
            expect(query.getSlot(app, 'coverage')).to.be.equal('Kharkiv');
            expect(query.getSlot(app, 'year')).to.be.equal(2017);
          });
      });
    });
  });
});
