const { expect } = require('chai');
const rewire = require('rewire');
const sinon = require('sinon');

const middleware = rewire('../../../../src/actions/_high-order-handlers/middlewares/find-repair-scheme');

describe('actions', () => {
  describe('middlewares', () => {
    describe('find repair scheme', () => {
      let ctx;
      let slotScheme;

      beforeEach(() => {
        slotScheme = {
          prompts: {},
          repair: 'some repair phrases',
        };
        ctx = {
          brokenSlots: {
            a: 1,
            b: 2,
          },
          slotScheme,
        };
      });

      it('should find specialized slot scheme', () => {
        const repairSlotScheme = { repair: 'fake repair slot scheme' };
        const promptSelector = {
          getPromptsForSlots: sinon.stub().returns(repairSlotScheme),
        };
        middleware.__set__('promptSelector', promptSelector);

        return middleware()(ctx)
          .then(({ repairScheme, suggestionsScheme }) => {
            expect(suggestionsScheme).to.be.equal(repairSlotScheme);
            expect(repairScheme).to.be.equal(repairSlotScheme.repair);
          });
      });

      it(`should use default slot scheme prompts 
          if repair slot scheme doesn't have repair section`, () => {
        const repairSlotScheme = {};
        const promptSelector = {
          getPromptsForSlots: sinon.stub().returns(repairSlotScheme),
        };
        middleware.__set__('promptSelector', promptSelector);

        return middleware()(ctx)
          .then(({ repairScheme, suggestionsScheme }) => {
            expect(suggestionsScheme).to.be.equal(repairSlotScheme);
            expect(repairScheme).to.be.equal(slotScheme.repair);
          });
      });
    });
  });
});
