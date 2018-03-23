const {expect} = require('chai');
const rewire = require('rewire');

const middleware = rewire('../../../../src/actions/high-order-handlers/middlewares/feeder-from-playlist');
const playlist = require('../../../../src/state/playlist');

const mockApp = require('../../../_utils/mocking/app');
const mockFeeders = require('../../../_utils/mocking/feeders');

describe('actions', () => {
  describe('middlewares', () => {
    let app;
    const feeder = {};
    let feeders;

    beforeEach(() => {
      app = mockApp();

      feeders = mockFeeders({
        getByNameReturn: feeder,
      });
      middleware.__set__('feeders', feeders);
    });

    describe('feeder from playlist', () => {
      it('should return Promise', () => {
        expect(middleware()({app, playlist})).to.have.property('then');
      });

      it('should put feeder in context', () => {
        playlist.setFeeder(app, feeder);
        return middleware()({app, playlist})
          .then(context => {
            expect(context).to.have.property('feeder', feeder);
          });
      });
    });
  });
});
