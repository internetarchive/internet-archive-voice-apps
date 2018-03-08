const {expect} = require('chai');
const rewire = require('rewire');

const playlist = require('../../../../state/playlist');
const query = require('../../../../state/query');

const mockApp = require('../../../_utils/mocking/app');
const mockDialog = require('../../../_utils/mocking/dialog');
const mockAlbumFeeder = require('../../../_utils/mocking/feeders/albums');
const mockFeeders = require('../../../_utils/mocking/feeders');
const middleware = rewire('../../../../actions/high-order-handlers/middlewares/playback-fulfillment');

describe('actions', () => {
  describe('middlewares', () => {
    describe('playback fulfilment', () => {
      let albumFeeder;
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
        middleware.__set__('dialog', dialog);
        middleware.__set__('feeders', feeders);
      });

      it('should run fulfilment with slots', () => {
        const app = mockApp({
          argument: {
            creators: 'the-band',
          },
        });
        const slotScheme = {
          fulfillment: 'test-function',
        };
        return Promise.resolve({app, playlist, query, slotScheme})
          .then(middleware())
          .then(() => {
            expect(feeders.getByName).to.have.been.calledWith('test-function');
            expect(playlist.getFeeder(app)).to.be.equal('test-function');
            expect(albumFeeder.build).to.have.been.calledOnce;
            expect(albumFeeder.isEmpty).to.have.been.calledOnce;
            expect(albumFeeder.getCurrentItem).to.have.been.calledOnce;
            expect(dialog.playSong).to.have.been.calledOnce;
          });
      });
    });
  });
});
