const {expect} = require('chai');
const rewire = require('rewire');

const builder = rewire('../../../src/actions/_high-order-handlers/in-one-go');
const playlist = require('../../../src/state/playlist');
const query = require('../../../src/state/query');

const mockApp = require('../../_utils/mocking/platforms/app');
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
        let app;
        let middlewares;

        beforeEach(() => {
          app = mockApp();
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
});
