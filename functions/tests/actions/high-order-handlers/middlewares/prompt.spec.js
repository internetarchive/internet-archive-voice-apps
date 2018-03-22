const {expect} = require('chai');

const middleware = require('../../../../src/actions/high-order-handlers/middlewares/prompt');

describe('actions', () => {
  describe('middlewares', () => {
    describe('prompts', () => {
      it('should find right prompt when we missed few slots and there is right prompt to fill them', () => {
        const slots = {
          artist: 'The Band',
        };

        const slotScheme = {
          prompts: [{
            confirm: ['albumn'],
            speech: ['What is the albumn?'],
          }],

          slots: [
            'artist',
            'albumn',
            'year',
          ],
        };

        return middleware()({slots, slotScheme})
          .then(args => {
            expect(args).to.have.property('speech')
              .to.have.members(['What is the albumn?']);
            expect(args).to.have.property('suggestionsScheme');
          });
      });

      it(`shouldn't find return prompt when we don't have right prompts`, () => {
        const slots = {
          artist: 'The Band',
        };

        const slotScheme = {
          prompts: [{
            confirm: ['artist'],
            speech: ['What is the artist?'],
          }],

          slots: [
            'artist',
            'albumn',
            'year',
          ],
        };

        return middleware()({slots, slotScheme})
          .then(args => {
            expect(args).to.not.have.property('speech');
            expect(args).to.not.have.property('suggestionsScheme');
          });
      });
    });
  });
});
