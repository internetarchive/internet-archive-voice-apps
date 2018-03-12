const {expect} = require('chai');

const query = require('../../../../state/query');

const mockApp = require('../../../_utils/mocking/app');
const middleware = require('../../../../actions/high-order-handlers/middlewares/copy-arguments-to-slots');

describe('actions', () => {
  describe('middlewares', () => {
    describe('copy arguments to slots', () => {
      it('should populate arguments to slots', () => {
        const app = mockApp({
          argument: {
            creators: 'the-band',
          },
        });
        const slotScheme = {
          slots: ['creators'],
        };
        return Promise.resolve({app, query, slotScheme})
          .then(middleware())
          .then(({app, query, slotsScheme}) => {
            expect(query.getSlots(app)).to.be.deep.equal({
              creators: 'the-band',
            });
          });
      });
    });
  });
});
