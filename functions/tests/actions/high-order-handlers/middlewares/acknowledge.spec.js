const {expect} = require('chai');
const rewire = require('rewire');
const sinon = require('sinon');

const middleware = rewire('../../../../src/actions/high-order-handlers/middlewares/acknowledge');

const mockSelectors = ({findResult = null} = {}) => ({
  find: sinon.stub().returns(findResult),
});

describe('actions', () => {
  describe('middlewares', () => {
    let selectors;

    describe('acknowledge', () => {
      it('should find right acknowledge when we have new values', () => {
        const template = 'Hello World!';
        selectors = mockSelectors({
          findResult: template,
        });
        middleware.__set__('selectors', selectors);

        const slots = {
          name: 'value',
        };

        const slotScheme = {
          acknowledges: [],
        };
        const newValues = {
          name: 'value',
        };

        return middleware()({slots, slotScheme, newValues})
          .then(({speech}) => {
            expect(selectors.find).to.been.calledWith(
              slotScheme.acknowledges,
              {prioritySlots: ['name'], slots}
            );
            expect(speech).to.have.members([
              template,
            ]);
          });
      });

      it(`shouldn't find acknowledge when we don't have new values`, () => {
        selectors = mockSelectors({
          findResult: 'Hello World!',
        });
        middleware.__set__('selectors', selectors);

        const slotScheme = {
          acknowledges: [],
        };
        const newValues = {};

        return middleware()({slotScheme, newValues})
          .then(args => {
            expect(selectors.find).to.not.been.called;
            expect(args).to.not.have.property('speech');
          });
      });
    });
  });
});
