const {expect} = require('chai');
const rewire = require('rewire');

const middleware = rewire('../../../../src/actions/high-order-handlers/middlewares/playlist-from-feeder');
const playlist = require('../../../../src/state/playlist');

const mockApp = require('../../../_utils/mocking/app');
const mockAlbums = require('../../../_utils/mocking/feeders/albums');

describe('actions', () => {
  describe('middlewares', () => {
    let app;
    let feeder;

    beforeEach(() => {
      app = mockApp();
      feeder = mockAlbums();
    });

    describe('playlist from feeder', () => {
      it('should return Promise', () => {
        expect(middleware()({app, feeder, playlist})).to.have.property('then');
      });

      it('should play song', () => {
        const feederName = 'Albums';
        return middleware()({app, feeder, feederName, playlist})
          .then(context => {
            expect(playlist.getFeeder(app)).to.be.equal(feederName);
            expect(feeder.build).to.be.called;
            expect(feeder.isEmpty).to.be.called;
          });
      });
    });
  });
});
