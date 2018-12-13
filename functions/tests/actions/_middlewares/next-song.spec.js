const { expect } = require('chai');

const { nextSong } = require('../../../src/actions/_middlewares/next-song');

const mockFeeder = require('../../_utils/mocking/feeders/albums');

describe('actions', () => {
  describe('middlewares', () => {
    let feeder;

    beforeEach(() => {
      feeder = mockFeeder();
    });

    describe('next song', () => {
      it('should return Promise', () => {
        expect(nextSong()({ feeder })).to.have.property('then');
      });

      it('should can next song', () => {
        return nextSong()({ feeder })
          .then(() => {
            expect(feeder.hasNext).to.have.been.called;
            expect(feeder.next).to.have.been.called;
          });
      });
    });
  });
});
