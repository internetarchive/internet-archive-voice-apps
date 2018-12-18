const { expect } = require('chai');

const middleware = require('../../../src/actions/_middlewares/copy-new-values-to-query-store');

const mockApp = require('../../_utils/mocking/platforms/app');

describe('actions / middlewares / copy arguments to slots', () => {
  it('should populate arguments to slots', () => {
    const app = mockApp();

    const newValues = {
      creators: 'the-band',
    };

    return Promise.resolve({ app, newValues })
      .then(middleware())
      .then(({ app }) => {
        expect(app.persist.setData).to.be.called;
        expect(app.persist.setData.args[0][1]).to.deep.equal({
          values: {
            creators: 'the-band',
          }
        });
      });
  });
});
