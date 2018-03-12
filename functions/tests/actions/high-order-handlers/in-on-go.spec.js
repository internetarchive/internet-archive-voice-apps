const {expect} = require('chai');
const rewire = require('rewire');

const builder = rewire('../../../actions/high-order-handlers/in-one-go');
const playlist = require('../../../state/playlist');
const query = require('../../../state/query');
const mockApp = require('../../_utils/mocking/app');
const mockFeeders = require('../../_utils/mocking/feeders');
const mockAlbumFeeder = require('../../_utils/mocking/feeders/albums');
const mockDialog = require('../../_utils/mocking/dialog');
const playbackFulfillment = rewire('../../../actions/high-order-handlers/middlewares/playback-fulfillment');

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

        beforeEach(() => {
          albumFeeder = mockAlbumFeeder({
            getCurrentItemReturns: {},
          });
          feeders = mockFeeders({
            getByNameReturn: albumFeeder,
          });
          dialog = mockDialog();
          playbackFulfillment.__set__('dialog', dialog);
          playbackFulfillment.__set__('feeders', feeders);
          builder.__set__('playbackFulfillment', playbackFulfillment);
          action = builder.build({strings, playlist, query});
        });

        it('should populate to slots passed arguments', () => {
          app = mockApp({
            argument: {
              creators: 'the-band',
            },
          });
          return action.handler(app)
            .then(() => {
              expect(query.getSlots(app)).to.have.property(
                'creators', 'the-band'
              );
            });
        });

        it('should pupulate defaults', () => {
          app = mockApp({
            argument: {
              creators: 'the-band',
            },
          });
          return action.handler(app)
            .then(() => {
              expect(query.getSlots(app)).to.be.deep.equal({
                collectionId: [
                  'etree',
                  'georgeblood',
                ],
                creators: 'the-band',
                order: 'random',
              });
            });
        });

        it('should run fulfillment', () => {
          app = mockApp({
            argument: {
              creators: 'the-band',
            },
          });
          return action
            .handler(app)
            .then(() => {
              expect(feeders.getByName).to.have.been.calledWith('albums-async');
              expect(albumFeeder.isEmpty).to.have.been.calledOnce;
              expect(albumFeeder.getCurrentItem).to.have.been.calledOnce;
              expect(dialog.playSong).to.have.been.calledOnce;
            });
        });
      });
    });
  });
});
