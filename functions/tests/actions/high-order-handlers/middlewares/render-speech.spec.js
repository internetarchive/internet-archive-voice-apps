const {expect} = require('chai');

const middleware = require('../../../../src/actions/high-order-handlers/middlewares/render-speech');

describe('actions', () => {
  describe('middlewares', () => {
    describe('render speech', () => {
      const slots = {
        departure: 'Kyiv',
        destination: 'San Francisco',
      };

      const speeches = [
        'Travel from {{departure}} to {{destination}}.',
        'And then back from {{destination}} to {{departure}}.'
      ];

      it('should render speech string in context of slots', () => {
        return middleware()({
          speech: speeches[0],
          slots
        })
          .then(res => {
            expect(res).to.have.property(
              'speech', 'Travel from Kyiv to San Francisco.'
            );
          });
      });

      it('should render array of speeches in context of slots', () => {
        return middleware()({
          speech: speeches,
          slots
        })
          .then(res => {
            expect(res).to.have.property(
              'speech'
            ).which.has.members([
              'Travel from Kyiv to San Francisco.',
              'And then back from San Francisco to Kyiv.',
            ]);
          });
      });

      it(`should do nothing when we don't have speeches`, () => {
        return middleware()({
          slots
        })
          .then(res => {
            expect(res).to.be.deep.equal({
              slots,
            });
          });
      });
    });
  });
});
