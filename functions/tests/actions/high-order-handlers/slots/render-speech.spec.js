const {expect} = require('chai');

const middleware = require('../../../../src/actions/high-order-handlers/middlewares/render-speech');

describe('actions', () => {
  describe('middlewares', () => {
    describe('render speech', () => {
      const slots = {
        departure: 'Kyiv',
        destination: 'San Francisco',
      };

      it('should render speech string in context of slots', () => {
        return middleware()({
          speech: 'Travel from {{departure}} to {{destination}}',
          slots
        })
          .then(res => {
            expect(res).to.have.property(
              'speech', 'Travel from Kyiv to San Francisco'
            );
          });
      });
    });
  });
});
