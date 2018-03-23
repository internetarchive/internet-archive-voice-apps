const {expect} = require('chai');
const rewire = require('rewire');

const builder = rewire('../../../src/actions/high-order-handlers/in-one-go');
const playbackFulfillment = rewire('../../../src/actions/high-order-handlers/middlewares/playback-fulfillment');
const playlist = require('../../../src/state/playlist');
const query = require('../../../src/state/query');

const mockApp = require('../../_utils/mocking/app');
const mockFeeders = require('../../_utils/mocking/feeders');
const mockAlbumFeeder = require('../../_utils/mocking/feeders/albums');
const mockDialog = require('../../_utils/mocking/dialog');
const mockMiddlewares = require('../../_utils/mocking/middlewares');

const strings = require('./fixtures/in-on-go.json');

describe('actions', () => {
  describe('high-order handlers', () => {
    describe('in one go handler', () => {
      describe('interface', () => {
        it('should have build method', () => {
          expect(builder).to.have.property('build');
        });

        it('should create object with handler method', () => {
          expect(builder.build({strings})).to.have.property('handler');
        });
      });

      describe('instance', () => {
        let action;
        let albumFeeder;
        let app;
        let dialog;
        let feeders;
        let middlewares;

        beforeEach(() => {
          albumFeeder = mockAlbumFeeder({
            getCurrentItemReturns: {},
          });
          app = mockApp();
          feeders = mockFeeders({
            getByNameReturn: albumFeeder,
          });
          dialog = mockDialog();
          playbackFulfillment.__set__('dialog', dialog);
          playbackFulfillment.__set__('feeders', feeders);
          builder.__set__('playbackFulfillment', playbackFulfillment);
          action = builder.build({strings, playlist, query});

          middlewares = mockMiddlewares([
            'copyArgumentToSlots',
            'copyDefaultsToSlots',
            'feederFromSlotScheme',
            'fulfilResolvers',
            'parepareSongData',
            'playlistFromFeeder',
            'playSong',
            'renderSpeech',
          ]);

          builder.__set__(middlewares);
        });

        it('should return promise', () => {
          expect(action.handler(app)).to.have.property('then');
        });
      });
    });
  });
});
