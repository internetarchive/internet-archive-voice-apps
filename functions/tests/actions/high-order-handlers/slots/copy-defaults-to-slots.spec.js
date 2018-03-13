const {expect} = require('chai');

const middleware = require('../../../../src/actions/high-order-handlers/middlewares/copy-defaults-to-slots');
const query = require('../../../../src/state/query');

const mockApp = require('../../../_utils/mocking/app');

describe('actions', () => {
  describe('middleware', () => {
    describe('copy defaults to slots', () => {
      it('should populate defaults to slots', () => {
        const app = mockApp();
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

      it(`should shouldn't ovewrited already defined slots`, () => {
        const app = mockApp();
        query.setSlot(app, 'band', 'other one');
        const slotScheme = {
          defaults: {
            band: 'the-band',
          }
        };
        return Promise.resolve({app, query, slotScheme})
          .then(middleware())
          .then(({app, query, slotsScheme}) => {
            expect(query.getSlots(app)).to.be.deep.equal({
              band: 'other one',
            });
          });
      });
    });
  });
});
