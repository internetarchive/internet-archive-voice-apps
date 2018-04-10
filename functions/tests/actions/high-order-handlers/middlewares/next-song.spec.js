const {expect} = require('chai');

const middleware = require('../../../../src/actions/high-order-handlers/middlewares/next-song');

const mockFeeder = require('../../../_utils/mocking/feeders/albums');

describe('actions', () => {
  describe('middlewares', () => {
    let feeder;

    beforeEach(() => {
      feeder = mockFeeder();
    });

    describe('next song', () => {
      it('should return Promise', () => {
        expect(middleware()({feeder})).to.have.property('then');
      });

      it('should can next song', () => {
        return middleware()({feeder})
          .then(context => {
            expect(feeder.hasNext).to.have.been.called;
            expect(feeder.next).to.have.been.called;
          });
      });
    });
  });
});
