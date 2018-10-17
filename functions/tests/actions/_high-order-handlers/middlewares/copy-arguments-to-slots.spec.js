const { expect } = require('chai');

const middleware = require('../../../../src/actions/_high-order-handlers/middlewares/copy-arguments-to-slots');
const query = require('../../../../src/state/query');

const mockApp = require('../../../_utils/mocking/platforms/app');

describe('actions', () => {
  describe('middlewares', () => {
    describe('copy arguments to slots', () => {
      it('should populate arguments to slots', () => {
        const app = mockApp({
          getByName: {
            creators: 'the-band',
          },
        });

        const slotScheme = {
          slots: ['creators'],
        };

        return Promise.resolve({ app, query, slotScheme })
          .then(middleware())
          .then(({ app, query, slotsScheme }) => {
            expect(app.persist.setData).to.be.called;
            expect(app.persist.setData.args[0][1]).to.deep.equal({
              values: {
                creators: 'the-band',
              }
            });
          });
      });
    });
  });
});
