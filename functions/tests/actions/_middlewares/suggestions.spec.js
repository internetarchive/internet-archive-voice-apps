const { expect } = require('chai');
const rewire = require('rewire');
const sinon = require('sinon');

const mockApp = require('../../_utils/mocking/platforms/app');

const middleware = rewire('../../../src/actions/_middlewares/suggestions');

describe('actions', () => {
  describe('middlewares', () => {
    let app;
    const suggestions = [1970, 1980, 1990, 2000, 2010];

    beforeEach(() => {
      app = mockApp();
    });

    describe('suggestions', () => {
      it('should substitute static suggestions', () => {
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

      it('should optionally exclude slots', () => {
        const provider = sinon.stub().returns(Promise.resolve({
          items: suggestions,
        }));

        middleware.__set__('suggestionExtensions', {
          getSuggestionProviderForSlots: sinon.stub().returns(provider),
        });

        const suggestionsScheme = {
          confirm: ['years'],
        };

        return middleware({ exclude: ['year'] })({
          app,
          slots: {
            artist: 'the band',
            albumn: 'concert',
            year: 2000,
          },
          suggestionsScheme
        })
          .then(() => {
            expect(provider).to.be.calledWith({
              app,
              slots: {
                artist: 'the band',
                albumn: 'concert',
              },
            });
          });
      });

      it(`should skip middleware when we don't have suggestions scheme`, () => {
        const provider = sinon.stub().returns(Promise.resolve({
          items: suggestions,
        }));

        middleware.__set__('suggestionExtensions', {
          getSuggestionProviderForSlots: sinon.stub().returns(provider),
        });

        return middleware()({
          slots: {
            artist: 'the band',
            albumn: 'concert',
            year: 2000,
          },
        })
          .then(() => {
            expect(provider).to.not.be.called;
          });
      });
    });
  });
});
