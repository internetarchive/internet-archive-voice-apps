const {expect} = require('chai');

const query = require('../../../../state/query');

const mockApp = require('../../../_utils/mocking/app');
const middleware = require('../../../../actions/high-order-handlers/middlewares/copy-defaults-to-slots');

describe('actions', () => {
  describe('middleware', () => {
    describe('copy defaults to slots', () => {
      it('should populate defaults to slots', () => {
        const app = mockApp({
          argument: {
          },
        });
        const slotScheme = {
          defaults: {
            band: 'the-band',
            album: 'the-album',
            collections: ['etree', 'georgeblood'],
          }
        };
        return Promise.resolve({app, query, slotScheme})
          .then(middleware())
          .then(({app, query, slotsScheme}) => {
            expect(query.getSlots(app)).to.be.deep.equal({
              band: 'the-band',
              album: 'the-album',
              collections: ['etree', 'georgeblood'],
            });
          });
      });
    });
  });
});
