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

      it(`should get default repair phrases when we don't have prompts`, () => {
        const slots = {
          name: 'value',
        };
        const slotScheme = {
          repair: {
            speech: `We don't have this value`,
          }
        };
        const brokenSlots = {
          name: 'value',
        };
        promptSelector = {
          getPromptsForSlots: sinon.stub().returns(null),
        };
        middleware.__set__('promptSelector', promptSelector);

        return middleware()({brokenSlots, slots, slotScheme})
          .then(({speech}) => {
            expect(selectors.find).to.been.called;
            expect(selectors.find.args[0][0]).to.be.equal(slotScheme.repair.speech);
            expect(selectors.find.args[0][1]).to.be.deep.equal(
              {brokenSlots, slots, slotScheme}
            );
          });
      });

      it(`should get default repair phrases when prompt doesn't have repair phrase`, () => {
        const slots = {
          name: 'value',
        };
        const slotScheme = {
          repair: {
            speech: `We don't have this value`,
          }
        };
        const brokenSlots = {
          name: 'value',
        };
        let promptScheme = {
        };
        promptSelector = {
          getPromptsForSlots: sinon.stub().returns(promptScheme),
        };
        middleware.__set__('promptSelector', promptSelector);

        return middleware()({brokenSlots, slots, slotScheme})
          .then(() => {
            expect(selectors.find).to.been.called;
            expect(selectors.find.args[0][0]).to.be.equal(slotScheme.repair.speech);
            expect(selectors.find.args[0][1]).to.be.deep.equal(
              {brokenSlots, slots, slotScheme}
            );
          });
      });

      it(`should skip middleware if we don't have repair phrases here`, () => {
        const slots = {
          name: 'value',
        };
        const slotScheme = {
        };
        const brokenSlots = {
          name: 'value',
        };
        let promptScheme = {
        };
        promptSelector = {
          getPromptsForSlots: sinon.stub().returns(promptScheme),
        };
        middleware.__set__('promptSelector', promptSelector);

        return middleware()({brokenSlots, slots, slotScheme})
          .then(() => {
            expect(selectors.find).to.not.been.called;
          });
      });
    });
  });
});
