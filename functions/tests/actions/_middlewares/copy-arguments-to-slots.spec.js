const { expect } = require('chai');

const middleware = require('../../../src/actions/_middlewares/copy-arguments-to-slots');

const mockApp = require('../../_utils/mocking/platforms/app');

describe('actions / middlewares / copy arguments to slots', () => {
  it('should populate arguments to slots', () => {
    const app = mockApp({
      getByName: {
        creators: 'the-band',
      },
    });

    const slotScheme = {
      slots: ['creators'],
    };

    return Promise.resolve({ app, slotScheme })
      .then(middleware())
      .then(({ newValues }) => {
        expect(newValues).to.deep.equal({
          creators: 'the-band',
        });
      });
  });
});
