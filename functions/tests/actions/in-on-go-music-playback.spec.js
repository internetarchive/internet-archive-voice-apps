const { expect } = require('chai');
const rewire = require('rewire');

const action = rewire('../../src/actions/in-one-go-music-playback');

const mockApp = require('../_utils/mocking/platforms/app');
const mockMiddlewares = require('../_utils/mocking/middlewares/index');

const strings = require('./_high-order-handlers/fixtures/in-on-go.json');

describe('actions', () => {
  describe('in one go handler', () => {
    describe('instance', () => {
      let app;
      let middlewares;

      beforeEach(() => {
        app = mockApp();
        action.__set__('strings', strings);
        middlewares = mockMiddlewares([
          'copyArgumentToSlots',
          'copyDefaultsToSlots',
          'feederFromSlotScheme',
          'fulfilResolvers',
          'mapSongDataToSlots',
          'playlistFromFeeder',
          'playSong',
          'renderSpeech',
        ]);

        action.__set__(middlewares);
      });

      it('should return promise', () => {
        expect(action.handler(app)).to.have.property('then');
      });

      it('should clean session attributes in case of new session', () => {
        app = mockApp({
          isNewSession: true,
        });
        return action.handler(app)
          .then(() => {
            expect(app.persist.dropAll).to.have.been.calledOnce;
          });
      });
    });
  });
});
