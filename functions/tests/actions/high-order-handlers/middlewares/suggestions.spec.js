const {expect} = require('chai');
const rewire = require('rewire');
const sinon = require('sinon');

const middleware = rewire('../../../../src/actions/high-order-handlers/middlewares/suggestions');

describe('actions', () => {
  describe('middlewares', () => {
    describe('suggestions', () => {
      it('should substitute static suggestions', () => {
        const suggestions = [1970, 1980, 1990, 2000, 2010];

        const suggestionsScheme = {
          suggestions,
        };

        return middleware()({
          suggestionsScheme
        })
          .then((res) => {
            expect(res)
              .to.have.property('slots')
              .to.have.property('suggestions', suggestions);
            expect(res).to.have.property('suggestions', suggestions);
          });
      });

      it('should fetch and substitute dynamic suggestions', () => {
        const suggestions = [1970, 1980, 1990, 2000, 2010];
        const provider = sinon.stub().returns(Promise.resolve({
          items: suggestions,
        }));
        middleware.__set__('suggestionExtensions', {
          getSuggestionProviderForSlots: sinon.stub().returns(provider),
        });

        const suggestionsScheme = {
          confirm: ['years'],
        };

        return middleware()({
          suggestionsScheme
        })
          .then((res) => {
            expect(res)
              .to.have.property('slots')
              .to.have.property('suggestions')
              .which.has.members(suggestions);
            expect(res).to.have.property('suggestions')
              .which.has.members(suggestions);
          });
      });
    });
  });
});
