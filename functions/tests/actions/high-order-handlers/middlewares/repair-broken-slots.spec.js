const {expect} = require('chai');
const rewire = require('rewire');
const sinon = require('sinon');

const middleware = rewire('../../../../src/actions/high-order-handlers/middlewares/repair-broken-slots');

const mockSelectors = require('../../../_utils/mocking/selectors');

describe('actions', () => {
  describe('middlewares', () => {
    let promptScheme = {
      repair: {
        speech: [
          'Thanks!',
        ],
      },
    };
    let promptSelector;
    let selectors;
    const template = 'Hello World!';

    beforeEach(() => {
      promptSelector = {
        getPromptsForSlots: sinon.stub().returns(promptScheme),
      };
      middleware.__set__('promptSelector', promptSelector);
      selectors = mockSelectors({
        findResult: template,
      });
      middleware.__set__('selectors', selectors);
    });

    describe('repeat broken slots', () => {
      it('should find right acknowledge when we have broken values', () => {
        const slots = {
          name: 'value',
        };

        const slotScheme = {
          acknowledges: [],
        };
        const brokenSlots = {
          name: 'value',
        };

        return middleware()({brokenSlots, slots, slotScheme})
          .then(({speech}) => {
            expect(selectors.find).to.been.calledWith(
              promptScheme.repair.speech,
              {brokenSlots, slots, slotScheme}
            );
            expect(speech).to.have.members([
              template,
            ]);
          });
      });

      it(`shouldn't find acknowledge when we don't have broken slots`, () => {
        const slotScheme = {
          acknowledges: [],
        };
        const brokenSlots = {};

        return middleware()({brokenSlots, slotScheme})
          .then(args => {
            expect(selectors.find).to.not.been.called;
            expect(args).to.not.have.property('speech');
          });
      });
    });
  });
});
